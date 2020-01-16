import os
import sys
from datetime import timedelta

import environ

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# env promenne
env = environ.Env(
    # nastaveni typu a pripadne vychozi hodnoty
    DATABASE_URL=str,  # url pouzivane DB (napr. postgresql://postgres:postgres@localhost:5432/up)
    SECRET_KEY=str,  # tajny klic pro Django
    FIO_API_KEY=str,  # token pro pristup do Fia
    DEBUG=(bool, False),  # aktivace debug prostredi
    HEROKU=(bool, False),  # priznak nasazeni aplikace na Heroku
    ENVIRONMENT=str,  # nazev aktualniho prostredi, kde je aplikace spustena (pro Sentry)
    SENTRY_DSN=str,  # DSN klic pro Sentry
    MANUAL_PRODUCTION=(bool, False),  # pro rucni spusteni produkcni verze nastavit True
    BANK_ACTIVE=(bool, True),  # aktivace propojeni s bankou
    TESTS_RUNNING=(bool, False),  # indikace bezicich testu
    HEADLESS=(bool, True),  # indikace headless mode pro testy UI
)
# cteni z .env souboru
environ.Env.read_env(os.path.join(BASE_DIR, ".env"))

# vlastni konstanty
CONST_AUTH_EXPIRATION = 60 * 8  # minuty -> 8 hodin (60*8)
CONST_DB_CON_AGE = 600

# vlastni konstanty nactene z prostredi/souboru
BANK_ACTIVE = env("BANK_ACTIVE")
ENVIRONMENT = env("ENVIRONMENT")
FIO_API_KEY = env("FIO_API_KEY")
HEROKU = env("HEROKU")
MANUAL_PRODUCTION = env("MANUAL_PRODUCTION")
SENTRY_DSN = env("SENTRY_DSN")
HEADLESS = env("HEADLESS")
# osetreni pro bezici testy - rozpoznani spusteni z radky/promenna prostredi (kvuli IDE)
TESTS_RUNNING = env("TESTS_RUNNING") or (len(sys.argv) > 1 and sys.argv[1] in ["test", "behave"])

# Django konstanty
DEBUG = env("DEBUG")
SECRET_KEY = env("SECRET_KEY")
ALLOWED_HOSTS = ["*"]

# Application definition
INSTALLED_APPS = [
    "whitenoise.runserver_nostatic",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "admin.apps.AdminConfig",
    "rest_framework",
    "api.apps.ApiConfig",
    "django_filters",
    "debug_toolbar",
]
if not HEROKU:
    INSTALLED_APPS.append("behave_django")

# API
REST_FRAMEWORK = {
    # pouziva se JWTTokenUserAuthentication, aby se neprovadel pri kazdem req DB lookup na uzivatele
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTTokenUserAuthentication",
    ),
    "DEFAULT_FILTER_BACKENDS": ("django_filters.rest_framework.DjangoFilterBackend",),
    "DEFAULT_PERMISSION_CLASSES": ("rest_framework.permissions.IsAuthenticated",),
    "TEST_REQUEST_DEFAULT_FORMAT": "json",
}
SIMPLE_JWT = {
    # pouzivaji se Sliding tokens - 1 a tentyz token pro autentizaci i refresh
    "SLIDING_TOKEN_LIFETIME": timedelta(minutes=CONST_AUTH_EXPIRATION),
    "SLIDING_TOKEN_REFRESH_LIFETIME": timedelta(days=2),
    "AUTH_TOKEN_CLASSES": ("rest_framework_simplejwt.tokens.SlidingToken",),
    "AUTH_HEADER_TYPES": ("Bearer",),
}

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "debug_toolbar.middleware.DebugToolbarMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "up.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [os.path.join(BASE_DIR, "admin/templates")],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ]
        },
    }
]

WSGI_APPLICATION = "up.wsgi.application"

CACHES = {"default": {"BACKEND": "django.core.cache.backends.locmem.LocMemCache"}}

# Database
DATABASES = {"default": env.db()}
# v testech zpusobuje problemy, (neuzavrou se hned spojeni)
if not TESTS_RUNNING:
    DATABASES["default"]["CONN_MAX_AGE"] = CONST_DB_CON_AGE

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# Internationalization
LANGUAGE_CODE = "cs"
TIME_ZONE = "Europe/Prague"
USE_I18N = True
USE_L10N = True
USE_TZ = True
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))

# Static files
STATIC_ROOT = os.path.join(BASE_DIR, "staticfiles")
STATIC_URL = "/static/"

# debug toolbar
DEBUG_TOOLBAR_PANELS = [
    "ddt_request_history.panels.request_history.RequestHistoryPanel",
    "debug_toolbar.panels.versions.VersionsPanel",
    "debug_toolbar.panels.timer.TimerPanel",
    "debug_toolbar.panels.settings.SettingsPanel",
    "debug_toolbar.panels.headers.HeadersPanel",
    "debug_toolbar.panels.request.RequestPanel",
    "debug_toolbar.panels.sql.SQLPanel",
    "debug_toolbar.panels.staticfiles.StaticFilesPanel",
    "debug_toolbar.panels.templates.TemplatesPanel",
    "debug_toolbar.panels.cache.CachePanel",
    "debug_toolbar.panels.signals.SignalsPanel",
    "debug_toolbar.panels.logging.LoggingPanel",
    "debug_toolbar.panels.redirects.RedirectsPanel",
]
DEBUG_TOOLBAR_CONFIG = {
    "SHOW_TOOLBAR_CALLBACK": lambda request: True if DEBUG else False,
    "SHOW_COLLAPSED": True,
}

# Django konstanty pro bezpecnost
SECURE_REFERRER_POLICY = "strict-origin-when-cross-origin"  # Referer je potreba posilat na Sentry
X_FRAME_OPTIONS = "DENY"
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_BROWSER_XSS_FILTER = True
