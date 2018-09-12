# Webová aplikace pro projekt „Úspěšný prvňáček“
[![Build Status](https://travis-ci.com/rodlukas/UP-admin.svg?token=g1rDdptQG4SVzcH6FMo5&branch=master)](https://travis-ci.com/rodlukas/UP-admin)
[![codecov](https://codecov.io/gh/rodlukas/UP-admin/branch/master/graph/badge.svg?token=2kJIBqfP0a)](https://codecov.io/gh/rodlukas/UP-admin)

[Slack](https://uspesnyprvnacek.slack.com/messages) | [Sentry](https://sentry.io/uspesnyprvnacek/up-admin/) | [Travis CI](https://travis-ci.com/rodlukas/UP-admin) | [Heroku](https://dashboard.heroku.com/apps/uspesnyprvnacek)

Aplikace vytvořena v rámci BP na FIT ČVUT - [Repozitář s BP](https://github.com/rodlukas/bachelors-thesis)

## užitečné příkazy
* **MANUÁLNÍ SPUŠTĚNÍ PRODUKČNÍ VERZE:**
    1. v `up/production_settings.py` nastavit `MANUAL_PRODUCTION = True`
    2. `yarn install`
    3. přes `manage.py` spustit:
        1. `collectstatic --settings=up.production_settings --noinput`
        2. `runserver --settings=up.production_settings 0.0.0.0:8000`
            > **spuštění na jiném zařízení v síti:**
            > * povolit python+node ve firewallu (např. na chvíli interaktivní režim ESETu)
            > * na mobilním zařízení zadat privátní IP adresu počítače se serverem (zobrazí se např. při spouštění webpack-dev-serveru
            > * při změně privátní adresy restart webpack-dev-serveru
* **yarn:**
    * `yarn outdated`
    * `yarn add/remove [package]`
    * `yarn upgrade [package]`, `yarn upgrade [package]@[version]`
    * `yarn test/install`
* **HEROKU**
    * **vytvoření uživatele:** `heroku run python manage.py createsuperuser --settings=up.production_settings -a uspesnyprvnacek`
    * **připojení k DB z externí aplikace** - je potřeba přidat do URI na konec `?sslmode=require`
    * **kopírování DB mezi aplikacemi:** 
        * **staging** → **testing**: `heroku pg:copy uspesnyprvnacek-staging::DATABASE_URL DATABASE_URL --confirm uspesnyprvnacek-testing -a uspesnyprvnacek-testing`
    * **naplánování pravidelné zálohy DB:** `heroku pg:backups:schedule DATABASE_URL --at "03:00 Europe/Prague" -a uspesnyprvnacek`
        * **výpis záloh:** `heroku pg:backups -a uspesnyprvnacek`

## další informace
* každý den ve 3:00 se provádí automatická záloha databáze (viz. https://devcenter.heroku.com/articles/heroku-postgres-backups#scheduling-backups)
* [využité tipy k optimalizaci Djanga](https://www.revsys.com/tidbits/django-performance-simple-things/) + [další podobný článek](http://ses4j.github.io/2015/11/23/optimizing-slow-django-rest-framework-performance/)
* **respektování standardů** (tam, kde to má smysl): https://12factor.net/, https://roca-style.org/    

### statické soubory
* **nastavení Webpacku a Djanga:** http://v1k45.com/blog/modern-django-part-1-setting-up-django-and-react/
    * **super vysvetleni:** https://www.techiediaries.com/django-react-rest/
    * **popis autora nástrojů:** http://owaislone.org/blog/modern-frontends-with-django/, http://owaislone.org/blog/webpack-plus-reactjs-and-django/
    
### nasazení
* **checklist**
    * https://docs.djangoproject.com/en/2.0/howto/deployment/checklist/
    * +dalsi: https://wsvincent.com/django-best-practices/
* **deployment settings**
    * http://whitenoise.evans.io/en/stable/
    * https://devcenter.heroku.com/articles/deploying-python
    * https://github.com/sundayguru/django-react-heroku
    * https://developer.mozilla.org/en-US/docs/Learn/Server-side/Django/Deployment
    * travis + heroku: https://docs.travis-ci.com/user/deployment/heroku/
    * +inspirace: https://tutorial-extensions.djangogirls.org/en/heroku/ a https://simpleisbetterthancomplex.com/tutorial/2016/08/09/how-to-deploy-django-applications-on-heroku.html
    * +inspirace pro nodejs: https://medium.com/@nicholaskajoh/deploy-your-react-django-app-on-heroku-335af9dab8a3
    * inspirace pro proměnné prostředí: https://mitchel.me/2016/settings-management-in-django/
        
### API
* [custom serializer for nested resources](https://django.cowhite.com/blog/create-and-update-django-rest-framework-nested-serializers/)
* [best practises](https://www.vinaysahni.com/best-practices-for-a-pragmatic-restful-api)
* [jednoducha prace s djangorestframework](https://www.andreagrandi.it/2016/10/01/creating-a-production-ready-api-with-python-and-django-rest-framework-part-2/)
* [test driven api v DRF](https://scotch.io/tutorials/build-a-rest-api-with-django-a-test-driven-approach-part-2)
* [inspirace propojeni django, rest, react s reduxem](https://hackernoon.com/creating-websites-using-react-and-django-rest-framework-b14c066087c7)
* struktura v reactu podle [tohoto](https://sheharyar.me/blog/axios-with-react-for-making-requests/)

### přihlášení
* problematika ukladani tokenu (localstorage vs cookie)
    * https://stormpath.com/blog/where-to-store-your-jwts-cookies-vs-html5-web-storage
    * https://www.youtube.com/watch?v=WzfJgCOMIsU&feature=youtu.be&t=22m10s
    * https://auth0.com/blog/ten-things-you-should-know-about-tokens-and-cookies/#xss-xsrf
    * https://auth0.com/blog/cookies-vs-tokens-definitive-guide/
    * https://www.rdegges.com/2018/please-stop-using-local-storage/
    * https://auth0.com/docs/security/store-tokens
    * i s komentari s protinazory: https://medium.com/@rajaraodv/securing-react-redux-apps-with-jwt-tokens-fcfe81356ea0
    * https://spectrum.chat/thread/a051f64d-8103-48e4-92f8-99fc701a7ae9
* dokumentace: [zaklad od react-routeru](https://reacttraining.com/react-router/web/example/auth-workflow), [djangorestframework-jwt](http://getblimp.github.io/django-rest-framework-jwt/)
* inspirace: https://github.com/curtisgreene/message, vetsi inspirace: https://hptechblogs.com/using-json-web-token-react/
* hezky popis: https://medium.com/vandium-software/5-easy-steps-to-understanding-json-web-tokens-jwt-1164c0adfcec
* přihlášení na podobný princip jako: https://stackoverflow.com/questions/49819183/react-what-is-the-best-way-to-handle-authenticated-logged-in-state

### další
* [blog o djangu+react+rest](https://wsvincent.com/)
* [8 no-Flux strategies for React component communication](https://www.javascriptstuff.com/component-communication/)
* [Habits of Successful React components](https://javascriptplayground.com/habits-of-successful-react-components/)
