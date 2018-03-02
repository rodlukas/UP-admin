# cvut-fit-bibap-uspesnyprvnacek-code
[![Build Status](https://travis-ci.com/rodlukas/cvut-fit-bibap-uspesnyprvnacek-code.svg?token=g1rDdptQG4SVzcH6FMo5&branch=master)](https://travis-ci.com/rodlukas/cvut-fit-bibap-uspesnyprvnacek-code)
[![codecov](https://codecov.io/gh/rodlukas/cvut-fit-bibap-uspesnyprvnacek-code/branch/master/graph/badge.svg?token=2kJIBqfP0a)](https://codecov.io/gh/rodlukas/cvut-fit-bibap-uspesnyprvnacek-code)

FIT CTU bachelor thesis - code

## poznamky
* build pro produkci: ```python manage.py runserver --settings=up.production_settings```
    * buildi se podle [tohoto odkazu](http://v1k45.com/blog/modern-django-part-1-setting-up-django-and-react/) (super vysvetleni [tady](https://www.techiediaries.com/django-react-rest/) a taky jinde - [1](http://owaislone.org/blog/modern-frontends-with-django/), [2 (trochu deprecated)](http://owaislone.org/blog/webpack-plus-reactjs-and-django/)) a nodejs podle [tohoto odkazu](https://medium.com/@nicholaskajoh/deploy-your-react-django-app-on-heroku-335af9dab8a3)
    * deploy podle [tohoto odkazu](https://developer.mozilla.org/en-US/docs/Learn/Server-side/Django/Deployment) a inspirace take [timto](https://tutorial-extensions.djangogirls.org/en/heroku/) a [timto odkazem](https://simpleisbetterthancomplex.com/tutorial/2016/08/09/how-to-deploy-django-applications-on-heroku.html) a tutorialy (treba [tady](https://devcenter.heroku.com/articles/deploying-python)) na heroku + [git repo](https://github.com/sundayguru/django-react-heroku)
* [deployment checklist - TODO](https://docs.djangoproject.com/en/2.0/howto/deployment/checklist/)