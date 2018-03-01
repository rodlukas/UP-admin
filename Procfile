release: python manage.py migrate --settings=up.production_settings
web: gunicorn up.wsgi --log-file -