# FIT CTU Bachelor thesis - Web application for the project "Successful first-grader"
[![Build Status](https://travis-ci.com/rodlukas/cvut-fit-bibap-uspesnyprvnacek-code.svg?token=g1rDdptQG4SVzcH6FMo5&branch=master)](https://travis-ci.com/rodlukas/cvut-fit-bibap-uspesnyprvnacek-code)
[![codecov](https://codecov.io/gh/rodlukas/cvut-fit-bibap-uspesnyprvnacek-code/branch/master/graph/badge.svg?token=2kJIBqfP0a)](https://codecov.io/gh/rodlukas/cvut-fit-bibap-uspesnyprvnacek-code)

## užitečné příkazy
* vytvoření souboru `requirements.txt`: `pip freeze > requirements.txt`
* spuštění produkční verze: `python manage.py runserver --settings=up.production_settings`
* **HEROKU**
    * nastaveni uzivatele na heroku: `heroku run python manage.py createsuperuser --settings=up.production_settings -a uspesnyprvnacek`
    * pripojeni k heroku DB z externi aplikace - je potreba do URI pridat na konec `?sslmode=require`

---

## články
### statické soubory
* nastaveni webpacku a djanga (staticke soubory): http://v1k45.com/blog/modern-django-part-1-setting-up-django-and-react/
    * super vysvetleni: https://www.techiediaries.com/django-react-rest/
    * popis autora nástrojů: http://owaislone.org/blog/modern-frontends-with-django/, http://owaislone.org/blog/webpack-plus-reactjs-and-django/
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
        
### API
* [custom serializer for nested resources](https://django.cowhite.com/blog/create-and-update-django-rest-framework-nested-serializers/)
* [best practises](https://www.vinaysahni.com/best-practices-for-a-pragmatic-restful-api)
* [jednoducha prace s djangorestframework](https://www.andreagrandi.it/2016/10/01/creating-a-production-ready-api-with-python-and-django-rest-framework-part-2/)
* [test driven api v DRF](https://scotch.io/tutorials/build-a-rest-api-with-django-a-test-driven-approach-part-2)
* [inspirace propojeni django, rest, react s reduxem](https://hackernoon.com/creating-websites-using-react-and-django-rest-framework-b14c066087c7)
* [hezky popis django + api, proc je potreba, SPA...](https://wsvincent.com/django-rest-framework-tutorial/)
* struktura v reactu podle [tohoto](https://sheharyar.me/blog/axios-with-react-for-making-requests/)

### prihlaseni
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
