#!/usr/bin/env bash

export DJANGO_SETTINGS_MODULE=up.settings.production
pipenv run python manage.py collectstatic --noinput
pipenv run python manage.py migrate
