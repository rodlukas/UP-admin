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
* **yarn:**
    * `yarn outdated`
    * `yarn add/remove [package]`
    * `yarn upgrade [package]`, `yarn upgrade [package]@[version]`
    * `yarn install`
* **pipenv:**
    * `pipenv update --outdated`
    * `pipenv update` - update all
    * `pipenv update <pkg>`
* **HEROKU**
    * **vytvoření uživatele:** `heroku run python manage.py createsuperuser --settings=up.production_settings -a uspesnyprvnacek`
    * **připojení k DB z externí aplikace** - je potřeba přidat do URI na konec `?sslmode=require`
    * **kopírování DB mezi aplikacemi:** 
        * **staging** → **testing**: `heroku pg:copy uspesnyprvnacek-staging::DATABASE_URL DATABASE_URL --confirm uspesnyprvnacek-testing -a uspesnyprvnacek-testing`
    * **naplánování pravidelné zálohy DB:** `heroku pg:backups:schedule DATABASE_URL --at "03:00 Europe/Prague" -a uspesnyprvnacek`
        * **výpis záloh:** `heroku pg:backups -a uspesnyprvnacek`
    * CZ řazení - viz [heroku dokumentace](https://help.heroku.com/JSPK1LZU/how-to-change-an-order-result-by-locale-on-heroku-postgres) a příslušný [soubor](/admin/migrations/0037_auto_20190202_0956.py) s migrací

## Články pro inspiraci

### statické soubory
* [nwb](https://github.com/insin/nwb) s pomocí [tutoriálu](https://tamhv.github.io/2018/05/14/Setup-django-with-react-using-nwb/)
    * HMR: viz. [nwb faq](https://github.com/insin/nwb/blob/master/docs/FAQ.md#how-can-i-use-react-hot-loader-instead-of-react-transform) - využití nového [react-hot-loader](https://github.com/gaearon/react-hot-loader) spolu s nádstavbou [React-🔥-Dom](https://github.com/hot-loader/react-dom) pro fungování hooků

~~* **nastavení Webpacku a Djanga:** http://v1k45.com/blog/modern-django-part-1-setting-up-django-and-react/
    * super vysvětlení - https://www.techiediaries.com/django-react-rest/
    * popis autora nástrojů - http://owaislone.org/blog/modern-frontends-with-django/, http://owaislone.org/blog/webpack-plus-reactjs-and-django/~~
    
### nasazení
* **checklist**
    * https://docs.djangoproject.com/en/2.0/howto/deployment/checklist/
    * +další: https://wsvincent.com/django-best-practices/
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
* [jednoduchá práce s DRF](https://www.andreagrandi.it/2016/10/01/creating-a-production-ready-api-with-python-and-django-rest-framework-part-2/)
* [test driven api v DRF](https://scotch.io/tutorials/build-a-rest-api-with-django-a-test-driven-approach-part-2)
* [inspirace propojeni django, rest, react s reduxem](https://hackernoon.com/creating-websites-using-react-and-django-rest-framework-b14c066087c7)
* struktura v reactu podle [tohoto](https://sheharyar.me/blog/axios-with-react-for-making-requests/)

### přihlášení
* problematika ukládání tokenu (localstorage vs cookie)
    * https://stormpath.com/blog/where-to-store-your-jwts-cookies-vs-html5-web-storage
    * https://www.youtube.com/watch?v=WzfJgCOMIsU&feature=youtu.be&t=22m10s
    * https://auth0.com/blog/ten-things-you-should-know-about-tokens-and-cookies/#xss-xsrf
    * https://auth0.com/blog/cookies-vs-tokens-definitive-guide/
    * https://www.rdegges.com/2018/please-stop-using-local-storage/
    * https://auth0.com/docs/security/store-tokens
    * i s komentáři s protinázory: https://medium.com/@rajaraodv/securing-react-redux-apps-with-jwt-tokens-fcfe81356ea0
    * https://spectrum.chat/thread/a051f64d-8103-48e4-92f8-99fc701a7ae9
* dokumentace: [základ od react-routeru](https://reacttraining.com/react-router/web/example/auth-workflow), [djangorestframework-jwt](http://getblimp.github.io/django-rest-framework-jwt/)
* inspirace: https://github.com/curtisgreene/message, vetsi inspirace: https://hptechblogs.com/using-json-web-token-react/
* hezký popis: https://medium.com/vandium-software/5-easy-steps-to-understanding-json-web-tokens-jwt-1164c0adfcec
* přihlášení na podobný princip jako: https://stackoverflow.com/questions/49819183/react-what-is-the-best-way-to-handle-authenticated-logged-in-state

### React
* [inspirace pro protected router v Context API](https://medium.freecodecamp.org/how-to-protect-your-routes-with-react-context-717670c4713a)
* Pro zrychlení načítání se používá *lazy loading* a `React Suspense` 
(vše zaobaleno v error-boundary pro správné fungování) - viz 
[oficiální dokumentace](https://reactjs.org/docs/code-splitting.html) a další hezké články 
[1](https://hackernoon.com/lazy-loading-and-preloading-components-in-react-16-6-804de091c82d), 
[2](https://itnext.io/async-react-using-react-router-suspense-a86ade1176dc), 
[3](https://www.peterbe.com/plog/react-16.6-with-suspense-and-lazy-loading-components-with-react-router-dom)

### další
* [blog o djangu+react+rest](https://wsvincent.com/)
* [8 no-Flux strategies for React component communication](https://www.javascriptstuff.com/component-communication/)
* [Habits of Successful React components](https://javascriptplayground.com/habits-of-successful-react-components/)
* **knihy:**
    * [*React design patterns and best practices*](https://vufind.techlib.cz/Record/000975861) (ISBN: 978-1-78646-453-8)
    * [*Don't make me think, revisited*](https://vufind.techlib.cz/Record/001839977) (ISBN: 978-0-321-96551-6)

### testování
* základy a příklady BDD/behave
    * https://www.obeythetestinggoat.com/book/appendix_bdd.html
    * https://semaphoreci.com/community/tutorials/setting-up-a-bdd-stack-on-a-django-application
    * https://help.crossbrowsertesting.com/selenium-testing/frameworks/behave/
* [super tutoriál s příklady na behave](https://jenisys.github.io/behave.example/index.html)
* v případě problémech při UI testování:
    * použít [TerminalImageViewer](https://github.com/stefanhaustein/TerminalImageViewer) a snímek získat takto:
    ```python
    from random import randint
    
    file = randint(0, 100000)
    context.browser.save_screenshot(f'{file}.png')
    ```
