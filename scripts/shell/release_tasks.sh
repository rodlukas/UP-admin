#!/usr/bin/env bash

# DEPLOYED drzi debug_toolbar mimo INSTALLED_APPS, aby se nesbirala jeho statika (testy
# ji nepotrebuji - pri `manage.py test`/`behave` je TESTS_RUNNING true, takze toolbar
# v INSTALLED_APPS stejne neni); --ignore vynecha source mapy, ktere patri do Sentry
DEPLOYED=True pipenv run python manage.py collectstatic --noinput --ignore="*.map"
pipenv run python manage.py migrate
pipenv run python manage.py createcachetable
