# Webová aplikace pro projekt „Úspěšný prvňáček“ 
<img src="./admin/static/admin/android-chrome-192x192.png" alt="logo" width="60" align="right"/>

[![Build Status](https://travis-ci.com/rodlukas/UP-admin.svg?token=g1rDdptQG4SVzcH6FMo5&branch=master)](https://travis-ci.com/rodlukas/UP-admin)
[![codecov](https://codecov.io/gh/rodlukas/UP-admin/branch/master/graph/badge.svg?token=2kJIBqfP0a)](https://codecov.io/gh/rodlukas/UP-admin)

[Sentry](https://sentry.io/uspesnyprvnacek/up-admin/) | 
[Travis CI](https://travis-ci.com/rodlukas/UP-admin) | 
[Heroku](https://dashboard.heroku.com/apps) | 
[Slack](https://uspesnyprvnacek.slack.com/messages) | 
Logentries - 
[produkční](https://addons-sso.heroku.com/apps/20c2c1b9-7573-42c9-ba22-cfdc7568f1f9/addons/551eb689-3908-4088-9100-519dfb42e836) / 
[staging](https://addons-sso.heroku.com/apps/e3a9ca55-ccff-46ec-b37f-99ce57c75ee1/addons/f32bd464-be5c-4a70-bdbd-ca4b1c925803) / 
[testing](https://addons-sso.heroku.com/apps/20090cc9-a6a5-46f4-b6ff-516a1bb9ebf3/addons/398b1cfa-4aa4-499a-a3cd-300f2093c4b3) |
[GA](https://analytics.google.com/analytics/web/#/report-home/a53235943w186065128p183124243)

## Spuštění aplikace na lokálním prostředí
Pro spuštění je potřeba mít... TBD

## Užitečné příkazy
* **MANUÁLNÍ SPUŠTĚNÍ PRODUKČNÍ VERZE:**
    1. v `.env` nastavit `MANUAL_PRODUCTION=True` (nastaví se proměnná prostředí)
    2. `yarn install` (z rootu, automaticky se pak provede i build)
    3. přes `manage.py` spustit:
        1. `collectstatic --settings=up.production_settings --noinput`
        2. `runserver --settings=up.production_settings 0.0.0.0:8000`
* **spuštění na jiném zařízení v síti:**
    1. povolit python+node ve firewallu (např. na chvíli interaktivní režim ESETu)
    2. na mobilním zařízení zadat privátní IP adresu počítače se serverem (zobrazí se např. při spouštění webpack-dev-serveru
    3. při změně privátní adresy restart webpack-dev-serveru
    
