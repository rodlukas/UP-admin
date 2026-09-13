#!/usr/bin/env bash

# bez set -e by selhany collectstatic zustal skryty: skript by dobehl dal, vratil nulu
# a chyba by se projevila az jinde jako chybejici zaznam v manifestu statiky
set -e

# DEPLOYED drzi debug_toolbar mimo INSTALLED_APPS, aby se nesbirala jeho statika (testy
# ji nepotrebuji - pri `manage.py test`/`behave` je TESTS_RUNNING true, takze toolbar
# v INSTALLED_APPS stejne neni)
DEPLOYED=True pipenv run python manage.py collectstatic --noinput
pipenv run python manage.py migrate
pipenv run python manage.py createcachetable
