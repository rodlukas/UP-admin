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

`uspesnyprvnacek-db` běží na `flyio/postgres:14.4 (v0.0.33)`, tedy na stolonu, což je
u Fly odepsaná větev. `fly status` nabízí update na 14.6 (v0.0.41).

Časté hlášky `Health check for your postgres database has failed` **nejsou** o spotřebě
zdrojů – je to pg check padající na legacy stolon/consul infrastruktuře
(`no keeper info available`, resety spojení na `consul-fra-3`). Sama DB je na tom
s pamětí lépe než app stroj: page cache 96 MB, `MemAvailable` 53 MB, PSI io full 2 s
za šest měsíců. Hlášky `hit resource limits` s detailem cpu/memory/io jsou naopak vzácné.

Není to tedy urgentní, ale je to jediná věc v cestě, která stojí na deprecated
komponentě. Migrace na Managed Postgres je samostatné kolo – pozor na cenu, hosting
jede na legacy hobby plánu.

## 3. Cache Fio transakcí je per-proces

`CACHES` je `LocMemCache`, takže `FIO_CACHE_TIMEOUT_SECONDS = 60` platí zvlášť v každém
procesu. Fio se proto dotazuje častěji, než by muselo, a snadno narazí na svůj limit
intervalu – `409 překročení intervalu pro dotazování` je kvůli tomu v `FIO_API_ERRORS`
v [api/services.py](api/services.py).

S `gthread` je to méně bolestivé, protože vlákna jednoho workeru cache sdílejí, ale
mezi dvěma worker procesy pořád ne. Úplné řešení je cache table v DB
(`django.core.cache.backends.db.DatabaseCache` + `manage.py createcachetable`).
