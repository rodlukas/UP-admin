#!/usr/bin/env bash
# na heroku neni potreba provadet collectstatic, export promennych nelze provest

python manage.py migrate
