#!/usr/bin/env bash

# Kroky na sobe zavisi, takze pri selhani nesmi pokracovat ani vratit nulu. Retezi se
# pres && a ne pres `set -e`, protoze README skript i sourcuje - `set -e` by pak zustal
# armovany v shellu uzivatele a prvni nenulovy navrat by mu zavrel terminal.
# DEPLOYED drzi debug_toolbar mimo INSTALLED_APPS, aby se nesbirala jeho statika (testy
# ji nepotrebuji - pri `manage.py test`/`behave` je TESTS_RUNNING true, takze toolbar
# v INSTALLED_APPS stejne neni).
DEPLOYED=True pipenv run python manage.py collectstatic --noinput &&
    pipenv run python manage.py migrate &&
    pipenv run python manage.py createcachetable
