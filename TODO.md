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

## 1. Gunicorn `--preload`

Největší dostupná výhra v paměti – odhadem 30–40 MB. Bez preloadu má každý worker
vlastní kopii kódu Djanga; s ním se naimportuje jednou v masteru a forkne, takže se
kódové stránky sdílejí přes copy-on-write. Ušetřená paměť by šla do page cache, které
je teď 27 MB, a zrychlila by servírování statiky (jde přes WhiteNoise ve stejném procesu).

**Proč to není hotové:** `up/settings/production.py` volá `sentry_sdk.init()` při importu.
S `--preload` to proběhne v masteru **před** forkem a vlákna se přes fork nedědí, takže
je potřeba ověřit, že sentry-sdk 2.59 si background transport po forku korektně obnoví
(má na to `os.register_at_fork`, ale chce to doložit, ne předpokládat).

**Jak to ověřit:** změřit RSS workerů před a po (`/proc/[pid]/status`) a potvrdit, že se
z aplikace pořád propisují eventy do Sentry.

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

## 3. Cache Fio transakcí je per-proces

`CACHES` je `LocMemCache`, takže `FIO_CACHE_TIMEOUT_SECONDS = 60` platí zvlášť v každém
procesu. Fio se proto dotazuje častěji, než by muselo, a snadno narazí na svůj limit
intervalu – `409 překročení intervalu pro dotazování` je kvůli tomu v `FIO_API_ERRORS`
v [api/services.py](api/services.py).

S `gthread` je to méně bolestivé, protože vlákna jednoho workeru cache sdílejí, ale
mezi dvěma worker procesy pořád ne. Úplné řešení je cache table v DB
(`django.core.cache.backends.db.DatabaseCache` + `manage.py createcachetable`).

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
- [fly.test.toml:38-41](fly.test.toml) i [fly.prod.toml:38-41](fly.prod.toml) →
  `[services.concurrency]` s `hard_limit = 25`, `soft_limit = 20` – Fly proxy tedy
  pustí na ten samý stroj až 25 souběžných spojení, tj. **3× víc, než gunicorn zvládne
  rozpracovat**.

Přebytek se nefrontuje u proxy (ten už si myslí, že je pod soft_limitem), ale visí
uvnitř gunicornu na blokujícím I/O – přesně scénář z bodu výše se slow-client DoS.
Běžná stránka s pár statickými assety + zároveň někdo jiný na loginu snadno vyčerpá
těch 8 slotů; zbytek requestů pak buď narazí na 60s timeout (`--timeout 60` v
Dockerfile), nebo nakumulovaná paměť spustí OOM killer. To se navenek projevuje přesně
jako hlášeno – „nejde se přihlásit", „nenačte se web", nedeterministicky.

**`fly.prod.toml` má identickou konfiguraci** (256 MB, hard_limit 25/soft_limit 20) –
není důvod čekat, že se produkce chová jinak, jen se to možná zatím nepozorovalo /
nehlásilo.

**Rychlá, bezplatná oprava:** snížit `hard_limit`/`soft_limit` v obou `fly*.toml` na
reálnou kapacitu gunicornu (~8, s rezervou třeba 8/6) – proxy pak přebytek buď zafrontuje,
nebo rovnou odmítne, místo aby se hromadil uvnitř appky a vytáhl ji do timeoutu/OOM.
Nic to nestojí, je to čistě konfigurační změna.

**Robustnější oprava:** buď navýšit `memory_mb` (256 → 512) alespoň na testu, nebo
konečně vyřešit bod 1 (`--preload`) – obojí zvětší reálnou rezervu, ale `--preload`
vyžaduje napřed ověřit chování `sentry_sdk` po forku (viz bod 1), navýšení paměti je
okamžité a bez rizika, jen stojí navíc.
