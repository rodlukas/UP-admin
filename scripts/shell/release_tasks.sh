#!/usr/bin/env bash

export DJANGO_SETTINGS_MODULE=up.settings.production
python manage.py collectstatic --noinput
python manage.py migrate
