from .settings import *
import dj_database_url

ALLOWED_HOSTS = [
    'uspesnyprvnacek.herokuapp.com'
]

# Static files
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'assets'),
]

WEBPACK_LOADER = {
    'DEFAULT': {
        'BUNDLE_DIR_NAME': 'bundles/',
        'STATS_FILE': os.path.join(BASE_DIR, 'webpack-stats.prod.json'),
    }
}

DEBUG = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
SECURE_CONTENT_TYPE_NOSNIFF = True
CSRF_COOKIE_SECURE = True
X_FRAME_OPTIONS = 'DENY'

# Heroku: Update database configuration from $DATABASE_URL.
db_from_env = dj_database_url.config(conn_max_age=CONST_DB_CON_AGE)
DATABASES['default'].update(db_from_env)

if 'TRAVIS' in os.environ:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': 'travis_ci_test',
            'USER': 'postgres',
            'PASSWORD': '',
            'HOST': 'localhost',
            'PORT': '',
        }
    }
