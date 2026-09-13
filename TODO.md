# TODO

### Zkušební migrace na testu (12. 9. 2026)

Na `uspesnyprvnacek-test-db` proběhl zkušební přechod legacy Postgres → Postgres Flex (16 → 18, tedy
i s major skokem) formou nového clusteru + importu dat, ne upgradem na místě – `fly image update` na
legacy postgres nefunguje, jde jen mezi minor verzemi téhož major image. Cutover (`detach`/`attach`)
proběhl, appka na `uspesnyprvnacek-test` teď běží proti novému clusteru, data sedí (ověřeno přes
row-county v `auth_user`, `admin_client`, `admin_application`, `django_session`).

**Klíčové zjištění: `fly postgres import` nepoužívat.** Na 16→18 spadl dvakrát na `exit status 2`
bez jakéhokoli use itelného detailu – chyba padá uvnitř SSH session dočasného
`flyio/postgres-importer` stroje, kterou flyctl nikam neloguje (ani `--debug`, ani `~/.fly/logs/` ji
nezachytí). Ruční `pg_dump` → soubor → `pg_restore` těch samých dat proběhlo bez jediné chyby
(schema, indexy, FK, ACL, data). Na produkci půjde o ještě větší skok (14 → 18), takže automatický
import zkoušet vůbec nemá cenu.

**Postup pro produkci** (`uspesnyprvnacek-db`, `fra`, app `uspesnyprvnacek`):

0. Zjisti současnou velikost, ať nová stojí stejně (jinak `fly postgres create` interaktivně nabízí
   defaultně 3-uzlovou Production HA konfiguraci za $82–164/měsíc místo dnešních cca $2/měsíc za
   single-node dev):

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

2. Zjisti přístupové údaje ke staré DB (`fly postgres users list -a uspesnyprvnacek-db`) – heslo v
   chatu s AI neřešit, jde o produkční přístup k reálným datům.

3. Dump + restore ručně, přímo na cílovém stroji (má `pg_dump`/`pg_restore` rovnou v
   `/usr/lib/postgresql/<verze>/bin/`), rovnou pod finálním jménem databáze:

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

    Na `ERROR: database ... is being accessed by other users` (u nás to byl interní `flypgadmin`
    monitoring) pomůže
    `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='<dbname>' AND pid <> pg_backend_pid();`.

4. Ověř row-county mezi starou a novou DB v klíčových tabulkách.

5. Krátké maintenance okno, zopakuj krok 3 (rychlý re-dump), pak cutover – **pořadí detach před
   attach je důležité**, jinak není jisté čí zápis do `DATABASE_URL` secretu vyhraje:

    ```
    fly postgres detach uspesnyprvnacek-db --app uspesnyprvnacek
    fly postgres attach uspesnyprvnacek-db-flex --app uspesnyprvnacek \
      --database-name <dbname> --database-user <dbname> -y
    ```

    `detach` se ptá interaktivně (výběr ze seznamu), `attach` s `-y` proběhne rovnou.

6. Ověř appku (`fly status`, `curl`, `fly logs --no-tail`).

7. Starou `uspesnyprvnacek-db` nech běžet ještě pár dní jako rollback pojistku, pak ručně (nikdy
   neautomatizovat) `fly postgres destroy uspesnyprvnacek-db`.

## 3. Cache Fio transakcí je per-proces ✅ opraveno (12. 9. 2026)

`CACHES` byla `LocMemCache`, takže `FIO_CACHE_TIMEOUT_SECONDS = 60` platila zvlášť v každém procesu.
Fio se proto dotazovalo častěji, než by muselo, a snadno narazilo na svůj limit intervalu –
`409 překročení intervalu pro dotazování` je kvůli tomu v `FIO_API_ERRORS` v
[api/services.py](api/services.py). V praxi se to projevilo jako "Data se nepodařilo stáhnout –
překročení intervalu pro dotazování." při opakovaném refreshi přehledu (souběh dvou workerů, každý s
vlastní 60s cache).

S `gthread` to bylo méně bolestivé, protože vlákna jednoho workeru cache sdílejí, ale mezi dvěma
worker procesy pořád ne. `--preload` (bod 1) na tomhle nic nemění – cache dict je po forku sice
zdílený přes copy-on-write, ale první zápis v kterémkoliv workeru ho oddělí (COW), takže zůstávají 2
nezávislé cache stejně jako předtím.

**Oprava:** `CACHES` v `up/settings/production.py` přepnuto na
`django.core.cache.backends.db.DatabaseCache` (sdílené přes DB, tedy mezi všemi worker procesy i
mezi deployi). Tabulku `django_cache` zakládá `manage.py createcachetable` – idempotentní (viz
zdrojak Django `createcachetable.py`: kontroluje existenci tabulky přes
`connection.introspection.table_names()` a beze změny přeskočí, takže je bezpečné pouštět ho při
každém release), přidáno do `scripts/shell/release_tasks.sh` (CI) a `release_command` v obou
`fly*.toml` (deploy).
