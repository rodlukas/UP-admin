from .settings import *
import dj_database_url

# pro rucni spusteni produkcni verze nastavit True
MANUAL_PRODUCTION = False

ALLOWED_HOSTS = [
    'uspesnyprvnacek.herokuapp.com',
    'uspesnyprvnacek-staging.herokuapp.com',
]

RAVEN_CONFIG = {
    'dsn': 'https://45ed918ced1d4453914265b6bb4f98ab:3f6efffbcd9746979ab8339d312badcb@sentry.io/1247206',
}

LOGGING = {
    'version': 1,
    'disable_existing_loggers': True,
    'root': {
        'level': 'WARNING',
        'handlers': ['sentry'],
    },
    'formatters': {
        'verbose': {
            'format': '%(levelname)s %(asctime)s %(module)s '
                      '%(process)d %(thread)d %(message)s'
        },
    },
    'handlers': {
        'sentry': {
            'level': 'WARNING',  # To capture more than ERROR, change to WARNING, INFO, etc.
            'class': 'raven.contrib.django.raven_compat.handlers.SentryHandler',
            'tags': {'custom-tag': 'x'},
        },
        'console': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
            'formatter': 'verbose'
        }
    },
    'loggers': {
        'django.db.backends': {
            'level': 'ERROR',
            'handlers': ['console'],
            'propagate': False,
        },
        'raven': {
            'level': 'DEBUG',
            'handlers': ['console'],
            'propagate': False,
        },
        'sentry.errors': {
            'level': 'DEBUG',
            'handlers': ['console'],
            'propagate': False,
        },
    },
}

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

DEBUG = False
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

if MANUAL_PRODUCTION:
    ALLOWED_HOSTS += ['localhost']
    SECURE_SSL_REDIRECT = False
