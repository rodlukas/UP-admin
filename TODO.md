# TODO

Odložené věci navazující na diagnózu výpadků na fly.io (6. 9. 2026). Vlastní příčinou
byly 2 sync workery gunicornu za Fly proxy, který odpovědi nebufferuje – to je vyřešené
přepnutím na `gthread` v [Dockerfile](Dockerfile). Níže je to, co se záměrně nedělalo
zároveň s tím, aby šel efekt každé změny změřit zvlášť.

Naměřené limity app stroje (`shared-cpu-1x:256MB`), ze kterých to vychází:

| metrika | hodnota |
|---|---|
| `MemTotal` | 207 MB |
| `MemAvailable` | 10 MB |
| `SwapTotal` | 0 |
| RSS jednoho svěžího workeru | 58 MB |
| page cache | 27 MB |
| PSI io full (kumulativně od bootu) | 130 s |

Čísla se čtou přes `fly ssh console -a uspesnyprvnacek`; `ps` v slim image není,
takže RSS jde z `/proc/[pid]/status`.

## 1. Gunicorn `--preload` ✅ hotovo a ověřeno (12. 9. 2026)

Největší dostupná výhra v paměti – odhadem 30–40 MB. Bez preloadu má každý worker
vlastní kopii kódu Djanga; s ním se naimportuje jednou v masteru a forkne, takže se
kódové stránky sdílejí přes copy-on-write. Ušetřená paměť by šla do page cache, které
je teď 27 MB, a zrychlila by servírování statiky (jde přes WhiteNoise ve stejném procesu).

Fork-safety ověřena předem: žádný `AppConfig.ready()` hook, žádný scheduler, žádné
eager DB/cache spojení při importu. `_bank_executor` (`ThreadPoolExecutor`) nespouští
vlákna při konstrukci, jen lazy při prvním requestu. `sentry_sdk.init()`
(`up/settings/production.py`, verze 2.69.1) má explicitní per-pid check-and-restart
na background workeru/session flusheru (`worker.py`, `client.py`) – bezpečné před forkem.

**Nasazeno do `Dockerfile` (`--preload` u gunicorn CMD) a změřeno na
`uspesnyprvnacek-test`:**

- `mem_used` kleslo o ~30 MB (přesně odhad výše)
- PSI memory pressure spadl z `full avg300=38%` na `full avg300=0%` – appka předtím
  trávila třetinu času blokovaná na memory reclaimu, teď vůbec
- crash loop (WORKER TIMEOUT → SIGKILL v cyklu ob pár minut, viz bod 4) přestal
- master RSS vzrostl z ~21–26 MB na ~56 MB (drží sdílenou kopii importu), workery
  zůstaly na podobné velikosti (~74–76 MB) – to je čekané, sdílí se přes workery,
  ne že by se zmenšily jednotlivě

Mimochodem se potvrdilo i vedlejší zjištění: bisekce verzí (`gunicorn` 26.2.0→25.3.0,
případně dál Python 3.14→3.12) by tohle nevyřešila – zabitý worker měl v době OOM jen
běžných ~70 MB RSS, není to o nafouklém procesu, ale o součtu přes všechny procesy na
stroji. `--preload` je jediná ze zvažovaných změn, co ten součet skutečně snižuje.

## 2. Databáze na legacy Postgresu

`uspesnyprvnacek-db` běží na `flyio/postgres:14.6 (v0.0.41)`, tedy na stolonu, což je
u Fly odepsaná větev.

Časté hlášky `Health check for your postgres database has failed` **nejsou** o spotřebě
zdrojů – je to pg check padající na legacy stolon/consul infrastruktuře
(`no keeper info available`, resety spojení na `consul-fra-3`). Sama DB je na tom
s pamětí lépe než app stroj: page cache 96 MB, `MemAvailable` 53 MB, PSI io full 2 s
za šest měsíců. Hlášky `hit resource limits` s detailem cpu/memory/io jsou naopak vzácné.

Není to tedy urgentní, ale je to jediná věc v cestě, která stojí na deprecated
komponentě. Migrace na Managed Postgres je samostatné kolo – pozor na cenu, hosting
jede na legacy hobby plánu.

### Zkušební migrace na testu (12. 9. 2026)

Na `uspesnyprvnacek-test-db` proběhl zkušební přechod legacy Postgres → Postgres Flex
(16 → 18, tedy i s major skokem) formou nového clusteru + importu dat, ne upgradem na
místě – `fly image update` na legacy postgres nefunguje, jde jen mezi minor verzemi
téhož major image. Cutover (`detach`/`attach`) proběhl, appka na `uspesnyprvnacek-test`
teď běží proti novému clusteru, data sedí (ověřeno přes row-county v `auth_user`,
`admin_client`, `admin_application`, `django_session`).

**Klíčové zjištění: `fly postgres import` nepoužívat.** Na 16→18 spadl dvakrát na
`exit status 2` bez jakéhokoli use itelného detailu – chyba padá uvnitř SSH session
dočasného `flyio/postgres-importer` stroje, kterou flyctl nikam neloguje (ani
`--debug`, ani `~/.fly/logs/` ji nezachytí). Ruční `pg_dump` → soubor → `pg_restore`
těch samých dat proběhlo bez jediné chyby (schema, indexy, FK, ACL, data). Na produkci
půjde o ještě větší skok (14 → 18), takže automatický import zkoušet vůbec nemá cenu.

**Postup pro produkci** (`uspesnyprvnacek-db`, `fra`, app `uspesnyprvnacek`):

0. Zjisti současnou velikost, ať nová stojí stejně (jinak `fly postgres create`
   interaktivně nabízí defaultně 3-uzlovou Production HA konfiguraci za $82–164/měsíc
   místo dnešních cca $2/měsíc za single-node dev):
   ```
   fly scale show -a uspesnyprvnacek-db
   fly volumes list -a uspesnyprvnacek-db
   ```

1. Založ nový Flex cluster, neinteraktivně, stejná velikost:
   ```
   fly postgres create --name uspesnyprvnacek-db-flex --region fra \
     --flex --initial-cluster-size 1 \
     --vm-size <ze scale show> --volume-size <z volumes list> -o personal
   ```

2. Zjisti přístupové údaje ke staré DB (`fly postgres users list -a uspesnyprvnacek-db`)
   – heslo v chatu s AI neřešit, jde o produkční přístup k reálným datům.

3. Dump + restore ručně, přímo na cílovém stroji (má `pg_dump`/`pg_restore` rovnou
   v `/usr/lib/postgresql/<verze>/bin/`), rovnou pod finálním jménem databáze:
   ```
   fly ssh console -a uspesnyprvnacek-db-flex
   # uvnitř:
   PGPASSWORD=<produkcni_heslo> /usr/lib/postgresql/*/bin/pg_dump \
     "postgres://<user>@uspesnyprvnacek-db.flycast:5432/<dbname>?sslmode=disable" \
     -Fc -v -f /tmp/dump.fc
   PGPASSWORD=<heslo_noveho_clusteru> /usr/lib/postgresql/*/bin/createdb \
     -h localhost -U postgres <dbname>
   PGPASSWORD=<heslo_noveho_clusteru> /usr/lib/postgresql/*/bin/pg_restore \
     -h localhost -U postgres -d <dbname> --no-owner -v /tmp/dump.fc
   ```
   Na `ERROR: database ... is being accessed by other users` (u nás to byl interní
   `flypgadmin` monitoring) pomůže `SELECT pg_terminate_backend(pid) FROM
   pg_stat_activity WHERE datname='<dbname>' AND pid <> pg_backend_pid();`.

4. Ověř row-county mezi starou a novou DB v klíčových tabulkách.

5. Krátké maintenance okno, zopakuj krok 3 (rychlý re-dump), pak cutover –
   **pořadí detach před attach je důležité**, jinak není jisté čí zápis do
   `DATABASE_URL` secretu vyhraje:
   ```
   fly postgres detach uspesnyprvnacek-db --app uspesnyprvnacek
   fly postgres attach uspesnyprvnacek-db-flex --app uspesnyprvnacek \
     --database-name <dbname> --database-user <dbname> -y
   ```
   `detach` se ptá interaktivně (výběr ze seznamu), `attach` s `-y` proběhne rovnou.

6. Ověř appku (`fly status`, `curl`, `fly logs --no-tail`).

7. Starou `uspesnyprvnacek-db` nech běžet ještě pár dní jako rollback pojistku, pak
   ručně (nikdy neautomatizovat) `fly postgres destroy uspesnyprvnacek-db`.

## 3. Cache Fio transakcí je per-proces ✅ opraveno (12. 9. 2026)

`CACHES` byla `LocMemCache`, takže `FIO_CACHE_TIMEOUT_SECONDS = 60` platila zvlášť
v každém procesu. Fio se proto dotazovalo častěji, než by muselo, a snadno narazilo
na svůj limit intervalu – `409 překročení intervalu pro dotazování` je kvůli tomu
v `FIO_API_ERRORS` v [api/services.py](api/services.py). V praxi se to projevilo jako
"Data se nepodařilo stáhnout – překročení intervalu pro dotazování." při opakovaném
refreshi přehledu (souběh dvou workerů, každý s vlastní 60s cache).

S `gthread` to bylo méně bolestivé, protože vlákna jednoho workeru cache sdílejí, ale
mezi dvěma worker procesy pořád ne. `--preload` (bod 1) na tomhle nic nemění – cache
dict je po forku sice zdílený přes copy-on-write, ale první zápis v kterémkoliv
workeru ho oddělí (COW), takže zůstávají 2 nezávislé cache stejně jako předtím.

**Oprava:** `CACHES` v `up/settings/production.py` přepnuto na
`django.core.cache.backends.db.DatabaseCache` (sdílené přes DB, tedy mezi všemi
worker procesy i mezi deployi). Tabulku `django_cache` zakládá
`manage.py createcachetable` – idempotentní (viz zdrojak Django `createcachetable.py`:
kontroluje existenci tabulky přes `connection.introspection.table_names()` a beze
změny přeskočí, takže je bezpečné pouštět ho při každém release), přidáno do
`scripts/shell/release_tasks.sh` (CI) a `release_command` v obou `fly*.toml` (deploy).

## 4. Appka na testu (a s velkou pravděpodobností i na prod) pořád padá pod souběžnými requesty

Ověřeno 12. 9. 2026: `fly logs -a uspesnyprvnacek-test` ukázal **10 OOM/timeout
událostí za necelé 2 hodiny** – tedy pořád aktivní, nezávisle na DB migraci výše
(dělo se to shodně před i po přechodu na Flex, takže to není regrese z téhle práce).
Vzorek:

```
Out of memory: Killed process 646 (gunicorn) total-vm:630764kB, anon-rss:69600kB...
[ERROR] Worker (pid:646) was sent SIGKILL! Perhaps out of memory?
[CRITICAL] WORKER TIMEOUT (pid:644)
```

Tohle je stejná diagnóza jako v úvodu souboru (`gthread` za nebufferující Fly proxy na
256MB stroji), ale s jedním konkrétním, dřív nezaznamenaným zdrojem: **nesoulad mezi
Fly proxy a kapacitou gunicornu.**

- [Dockerfile:25](Dockerfile) → `--workers 2 --threads 4` = **8** souběžně
  zpracovávaných requestů na stroj.
- `fly.test.toml` i `fly.prod.toml` měly (v době diagnózy) `[services.concurrency]`
  s `hard_limit = 25`, `soft_limit = 20` – Fly proxy tedy pouštěla na ten samý stroj až
  25 souběžných spojení, tj. **3× víc, než gunicorn zvládal rozpracovat**. Aktuální stav
  po opravě je [fly.test.toml:42-44](fly.test.toml#L42-L44) a
  [fly.prod.toml:42-44](fly.prod.toml#L42-L44).

Přebytek se nefrontuje u proxy (ten už si myslí, že je pod soft_limitem), ale visí
uvnitř gunicornu na blokujícím I/O – přesně scénář z bodu výše se slow-client DoS.
Běžná stránka s pár statickými assety + zároveň někdo jiný na loginu snadno vyčerpá
těch 8 slotů; zbytek requestů pak buď narazí na 60s timeout (`--timeout 60` v
Dockerfile), nebo nakumulovaná paměť spustí OOM killer. To se navenek projevuje přesně
jako hlášeno – „nejde se přihlásit", „nenačte se web", nedeterministicky.

**Rychlá, bezplatná oprava ✅ nasazena (12. 9. 2026), neověřena pod zátěží:**
`hard_limit`/`soft_limit` v obou `fly*.toml` snížen na reálnou kapacitu gunicornu (8/6) –
proxy pak přebytek buď zafrontuje, nebo rovnou odmítne, místo aby se hromadil uvnitř appky
a vytáhl ji do timeoutu/OOM.

**Doplňkově ✅ nasazeno (12. 9. 2026), neověřeno pod zátěží:** přidán `[[statics]]` blok –
nejdřív na `fly.test.toml`, teď zrcadlený i do `fly.prod.toml`. Fly proxy pak servíruje
`/static/*` přímo z `guest_path` (`/usr/src/up-admin/staticfiles`, shodné se `STATIC_ROOT`
v `up/settings/base.py`), takže požadavky na statiku už vůbec nezabírají žádný z gunicorn
workerů/vláken – ke konfliktu z diagnózy výše tak dochází jen mezi requesty na dynamické
view, ne ještě navíc se statickými assety stránky. WhiteNoise middleware zůstává v Django
nakonfigurované (lokální běh bez Fly proxy), na testu a produkci ho ale `[[statics]]`
obchází.

Obě změny zatím nejsou ověřené pod reálnou zátěží (na rozdíl od bodu 1) – další krok je
zopakovat pozorování z `fly logs` po nasazení a potvrdit, že OOM/timeout eventy ustaly.

**Navýšení `memory_mb` není k dispozici** – v rámci současného Fly.io billingu je
256 MB strop, škálovat výš nejde. Jediná cesta k větší rezervě je tedy bod 1
(`--preload`), který ale napřed vyžaduje ověřit chování `sentry_sdk` po forku
(viz bod 1) – bez placeného navýšení není zkratka.
