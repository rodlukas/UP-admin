from .settings import *
from sentry_sdk.integrations.django import DjangoIntegration

# pro rucni spusteni produkcni verze nastavit True
MANUAL_PRODUCTION = False
# pro funkcni testy na Travisu
if os.getenv('TRAVIS'):
    MANUAL_PRODUCTION = True

ALLOWED_HOSTS = [
    'uspesnyprvnacek.herokuapp.com',
    'uspesnyprvnacek-staging.herokuapp.com',
    'uspesnyprvnacek-testing.herokuapp.com',
]

sentry_sdk.init(
    environment=ENVIRONMENT,
    integrations=[DjangoIntegration()]
)

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

# Django konstanty
SECURE_BROWSER_XSS_FILTER = True
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
SECURE_CONTENT_TYPE_NOSNIFF = True
CSRF_COOKIE_SECURE = True
X_FRAME_OPTIONS = 'DENY'

if MANUAL_PRODUCTION:
    DEBUG = False
    ALLOWED_HOSTS.append('localhost')
    SECURE_SSL_REDIRECT = False
