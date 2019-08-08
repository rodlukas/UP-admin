#!/usr/bin/env bash
# na heroku neni potreba provadet collectstatic

export DJANGO_SETTINGS_MODULE=up.production_settings
python manage.py migrate
