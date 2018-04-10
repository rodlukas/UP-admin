#!/bin/sh

export DJANGO_SETTINGS_MODULE=up.production_settings
python manage.py collectstatic --noinput --settings=up.production_settings
python manage.py migrate --settings=up.production_settings
