"""
Produkční konfigurace Django projektu.
Používá se pro nasazené aplikace, případně pro simulaci nasazené aplikace na lokálu (MANUAL_PRODUCTION).
Rozšiřuje základní konfiguraci ze souboru base.py.
"""
import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration
import os

from .base import *  # lgtm [py/polluting-import]

# pro korektni build a fungovani na CI
if os.getenv("CI"):
    MANUAL_PRODUCTION = True

ALLOWED_HOSTS = [
    "uspesnyprvnacek.herokuapp.com",
    "uspesnyprvnacek-staging.herokuapp.com",
    "uspesnyprvnacek-testing.herokuapp.com",
    "uspesnyprvnacek-demo.herokuapp.com",
]

sentry_sdk.init(environment=ENVIRONMENT, integrations=[DjangoIntegration()], release="%GIT_COMMIT")

STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

# Django konstanty pro bezpecnost
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_SSL_REDIRECT = True
SECURE_HSTS_SECONDS = 63072000  # 2 roky
SECURE_HSTS_PRELOAD = True
SECURE_HSTS_INCLUDE_SUBDOMAINS = True

# pravidla pro manualni produkci (pro jeji simulaci na lokalu/build a fungovani CI)
if MANUAL_PRODUCTION:
    STATICFILES_DIRS = [
        os.path.join(BASE_DIR, "frontend", "build")
    ]  # jen na CI (zde se pak slozka smaze) / manualni produkci
    DEBUG = False
    ALLOWED_HOSTS.append("localhost")
    SECURE_SSL_REDIRECT = False
    os.environ["SENTRY_DSN"] = SENTRY_DSN  # pro JS
