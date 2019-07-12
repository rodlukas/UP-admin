#!/usr/bin/env bash

export DJANGO_SETTINGS_MODULE=up.production_settings
python manage.py collectstatic --noinput
python manage.py migrate
