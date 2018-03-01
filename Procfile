release: python manage.py --settings=up.production_settings migrate
web: gunicorn up.wsgi --log-file -