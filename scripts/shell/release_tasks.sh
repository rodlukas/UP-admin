#!/usr/bin/env bash

pipenv run python manage.py collectstatic --noinput
pipenv run python manage.py migrate
