from .settings import *
import dj_database_url

ALLOWED_HOSTS = [
    'uspesnyprvnacek.herokuapp.com'
]

WEBPACK_LOADER = {
    'DEFAULT': {
        'BUNDLE_DIR_NAME': 'bundles/',
        'STATS_FILE': os.path.join(BASE_DIR, 'webpack-stats.prod.json'),
    }
}

SECRET_KEY = os.environ.get('SECRET_KEY')

DEBUG = False

# Heroku: Update database configuration from $DATABASE_URL.
db_from_env = dj_database_url.config(conn_max_age=CONST_DB_CON_AGE)
DATABASES['default'].update(db_from_env)

STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
