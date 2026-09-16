"""
Produkční konfigurace Django projektu.
Používá se pro nasazené aplikace, případně pro simulaci nasazené aplikace na lokálu (MANUAL_PRODUCTION).
Rozšiřuje základní konfiguraci ze souboru base.py.
"""

import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration
from sentry_sdk.integrations.logging import ignore_logger
from sentry_sdk.scrubber import EventScrubber
import os

from .base import *

ALLOWED_HOSTS = [
    "uspesnyprvnacek.fly.dev",
    "uspesnyprvnacek-test.fly.dev",
]

if SENTRY_DSN:
    sentry_sdk.init(
        environment=ENVIRONMENT,
        integrations=[DjangoIntegration()],
        release="%GIT_COMMIT",
        # SDK posila lokalni promenne ramcu (`include_local_variables` ma default True)
        # a vychozi scrubber nahrazuje jen klice z denylistu na PRVNI urovni. Heslo
        # z prihlaseni ale lezi vnorene - `attrs` v serializeru (api/tokens.py),
        # `authenticate_kwargs` v simplejwt, `data`/`value` v DRF - a tahle jmena
        # v denylistu nejsou, takze by heslo odeslo v plaintextu. Naměřeno na
        # `EventScrubber.scrub_event()`: bez `recursive` zbydou 2 vyskyty, s nim 0.
        event_scrubber=EventScrubber(recursive=True),
    )
    # gunicorn propaguje access log do rootu, odkud ho SDK bere jako breadcrumbs - radky
    # o stahovani statiky by pri stropu 100 breadcrumbu vytlacily to, co uzivatel delal
    ignore_logger("gunicorn.access")

# staticfiles backend musi zustat manifest-based, jinak by {% static %} generoval
# nehashovane URL bez cache bustingu (manifest vznika pri collectstatic,
# viz scripts/shell/release_tasks.sh)
STORAGES = {
    # "default" zachovava vychozi Django file storage (base.py zadne STORAGES nedefinuje)
    "default": {
        "BACKEND": "django.core.files.storage.FileSystemStorage",
    },
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}

# LocMemCache z base.py je per-proces - se 2 gunicorn workery (viz Dockerfile) tak
# kazdy drzi vlastni cache pro FIO_CACHE_KEY (api/services.py), takze se Fio API
# dotazuje az 2x castji, nez FIO_CACHE_TIMEOUT_SECONDS predpoklada, a snadno narazi
# na vlastni limit intervalu dotazovani (409). DatabaseCache je sdileny mezi procesy.
# Tabulka se zaklada pres `manage.py createcachetable`
# (scripts/shell/release_tasks.sh, release_command ve fly*.toml).
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.db.DatabaseCache",
        "LOCATION": "django_cache",
    }
}

# Django konstanty pro bezpecnost
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SECURE_SSL_REDIRECT = True

SECURE_HSTS_SECONDS = 63072000  # 2 roky
SECURE_HSTS_PRELOAD = True
SECURE_HSTS_INCLUDE_SUBDOMAINS = True

# pravidla pro manualni produkci (pro jeji simulaci na lokalu/build a fungovani CI)
if MANUAL_PRODUCTION:
    # jen na CI (zde se pak slozka smaze) / manualni produkci
    STATICFILES_DIRS = [os.path.join(BASE_DIR, "frontend", "build")]
    DEBUG = False
    ALLOWED_HOSTS.append("localhost")
    SECURE_SSL_REDIRECT = False
    os.environ["SENTRY_DSN"] = SENTRY_DSN  # pro JS
