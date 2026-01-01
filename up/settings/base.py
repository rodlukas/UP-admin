"""
Základní konfigurace Django projektu.
Je základem pro konfigurace v souborech local.py a production.py.
"""

import os
import sys
from datetime import timedelta

import environ

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# env promenne
env = environ.Env(
    # nastaveni typu a pripadne vychozi hodnoty
    BANK_ACTIVE=(bool, False),  # aktivace propojeni s bankou
    BANK_RENT_PRICE=(int, 0),  # vyse najmu (v Kc)
    DATABASE_URL=str,  # url pouzivane DB (napr. postgresql://postgres:postgres@localhost:5432/up)
    DEBUG=(bool, False),  # aktivace debug prostredi
    DEPLOYED=(bool, False),  # priznak nasazeni aplikace
    ENVIRONMENT=str,  # nazev aktualniho prostredi, kde je aplikace spustena (pro Sentry)
    FIO_API_KEY=(str, ""),  # token pro pristup do Fia
    MANUAL_PRODUCTION=(bool, False),  # pro simulaci produkcni verze nastavit: True (nutne i pro CI)
    SECRET_KEY=str,  # tajny klic pro Django
    SENTRY_DSN=(str, ""),  # DSN klic pro Sentry
    TESTS_BROWSER=(str, "firefox"),  # prohlizec pro UI testy: "firefox" nebo "chrome"
    TESTS_HEADLESS=(bool, True),  # indikace headless mode pro testy UI
    TESTS_RUNNING=(bool, False),  # indikace bezicich testu
)
# cteni z .env souboru
environ.Env.read_env(os.path.join(BASE_DIR, ".env"))

# vlastni konstanty
CONST_AUTH_EXPIRATION = 60 * 8  # minuty -> 8 hodin (60*8)
CONST_DB_CON_AGE = 600

# vlastni konstanty nactene z prostredi/souboru
BANK_ACTIVE = env("BANK_ACTIVE")
BANK_RENT_PRICE = env("BANK_RENT_PRICE")
ENVIRONMENT = env("ENVIRONMENT")
FIO_API_KEY = env("FIO_API_KEY")
TESTS_BROWSER = env("TESTS_BROWSER")
TESTS_HEADLESS = env("TESTS_HEADLESS")
DEPLOYED = env("DEPLOYED")
MANUAL_PRODUCTION = env("MANUAL_PRODUCTION")
SENTRY_DSN = env("SENTRY_DSN")
# osetreni pro bezici testy - rozpoznani spusteni z radky/promenna prostredi (kvuli IDE)
TESTS_RUNNING = env("TESTS_RUNNING") or (len(sys.argv) > 1 and sys.argv[1] in ["test", "behave"])

# Django konstanty
DEBUG = env("DEBUG")
SECRET_KEY = env("SECRET_KEY")

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
    "drf_spectacular",
    "api.apps.ApiConfig",
    "django_filters",
    "debug_toolbar",
]
if not DEPLOYED:
    INSTALLED_APPS.append("behave_django")

# API
REST_FRAMEWORK = {
    # pouziva se JWTTokenUserAuthentication, aby se neprovadel pri kazdem req DB lookup na uzivatele
    "DEFAULT_AUTHENTICATION_CLASSES": (
        # BasicAuthentication pro OpenAPI dokumentaci a Browsable API
        "rest_framework.authentication.BasicAuthentication",
        # JWTTokenUserAuthentication pro pristup k API z frontendu
        "rest_framework_simplejwt.authentication.JWTTokenUserAuthentication",
    ),
    "DEFAULT_FILTER_BACKENDS": ("django_filters.rest_framework.DjangoFilterBackend",),
    "DEFAULT_PERMISSION_CLASSES": ("rest_framework.permissions.IsAuthenticated",),
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "TEST_REQUEST_DEFAULT_FORMAT": "json",
}

SPECTACULAR_SETTINGS = {
    "TITLE": "ÚPadmin API",
    "DESCRIPTION": "Dokumentace *REST API* pro aplikaci **ÚPadmin**. **[Přejít do aplikace](/)**",
    "VERSION": "1.0.0",
    "SWAGGER_UI_FAVICON_HREF": "/static/admin/favicon.ico",
    "TAGS": [
        {
            "name": "Klienti",
            "description": "Operace pro správu klientů.",
        },
        {
            "name": "Stavy účasti",
            "description": "Operace pro správu stavů účastí klientů na lekcích.",
        },
        {
            "name": "Členství ve skupině",
            "description": "Operace pro správu členství klientů ve skupinách. Členství je entita obsahující počty předplacených skupinových lekcí.",
        },
        {
            "name": "Účasti",
            "description": "Operace pro správu účasti klienta na lekci. Účast je entita obsahující stav platby, stav účasti, poznámku.",
        },
        {
            "name": "Skupiny",
            "description": "Operace pro správu skupin klientů.",
        },
        {
            "name": "Kurzy",
            "description": "Operace pro správu kurzů, na které mohou klienti docházet.",
        },
        {
            "name": "Zájemci o kurzy",
            "description": "Operace pro správu zájemců o účast na kurzech.",
        },
        {
            "name": "Lekce",
            "description": "Operace pro správu jednotlivých lekcí.",
        },
        {
            "name": "Bankovní transakce",
            "description": "Operace pro získání výpisu transakcí z bankovního účtu.",
        },
        {
            "name": "Autentizace",
            "description": "Operace pro získání a obnovení JWT tokenů pro autentizaci.",
        },
    ],
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
    "csp.middleware.CSPMiddleware",
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
# nastaveni persistentnich spojeni s DB (mimo testy - zpusobuje problemy)
if not TESTS_RUNNING:
    DATABASES["default"]["CONN_MAX_AGE"] = CONST_DB_CON_AGE
# https://docs.djangoproject.com/fr/3.2/releases/3.2/#customizing-type-of-auto-created-primary-keys
DEFAULT_AUTO_FIELD = "django.db.models.AutoField"

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
USE_TZ = True
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))

# Static files
STATIC_ROOT = os.path.join(BASE_DIR, "staticfiles")
STATIC_URL = "/static/"

# debug toolbar
DEBUG_TOOLBAR_CONFIG = {
    "SHOW_TOOLBAR_CALLBACK": lambda request: True if DEBUG else False,
    "SHOW_COLLAPSED": True,
}

# Django konstanty pro bezpecnost
SECURE_REFERRER_POLICY = "strict-origin-when-cross-origin"  # Referer je potreba posilat na Sentry
X_FRAME_OPTIONS = "DENY"
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_BROWSER_XSS_FILTER = True

# CSP
# CSP pro Google Fonts
CSPURL_GOOGLE_FONTS_STYLE = "fonts.googleapis.com"
CSPURL_GOOGLE_FONTS_FONT = "fonts.gstatic.com"
# CSP pro Sentry
CSPURL_SENTRY = "https://*.sentry.io"

CSP_SELF = "'self'"
CSP_NONE = "'none'"

# CSP konfigurace
CSP_DEFAULT_SRC = (CSP_NONE,)
CSP_STYLE_SRC = (
    CSP_SELF,
    "'unsafe-inline'",
    CSPURL_GOOGLE_FONTS_STYLE,
)  # 'unsafe-inline' kvuli inline CSS v Sentry feedback formulari a Swagger UI
CSP_CONNECT_SRC = (CSP_SELF, CSPURL_SENTRY)
CSP_SCRIPT_SRC = (
    CSP_SELF,
    CSPURL_SENTRY,
)
CSP_FONT_SRC = (CSP_SELF, CSPURL_GOOGLE_FONTS_FONT)
CSP_IMG_SRC = (CSP_SELF, "data:")
CSP_FRAME_ANCESTORS = (CSP_NONE,)
CSP_FORM_ACTION = (CSP_NONE,)
CSP_BASE_URI = (CSP_NONE,)
CSP_MANIFEST_SRC = (CSP_SELF,)  # site.webmanifest
