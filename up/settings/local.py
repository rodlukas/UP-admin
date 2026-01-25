"""
Lokální (vývojová) konfigurace Django projektu.
Rozšiřuje základní konfiguraci ze souboru base.py.
"""

from .base import *

# Django konstanty
ALLOWED_HOSTS = ["*"]

# CSP
CSPURL_LOCALHOST = "http://*:3000"

SECURE_CSP["style-src"] = SECURE_CSP["style-src"] + [CSPURL_LOCALHOST]
SECURE_CSP["connect-src"] = SECURE_CSP["connect-src"] + [CSPURL_LOCALHOST, "ws://*:3000"]
SECURE_CSP["script-src"] = SECURE_CSP["script-src"] + [
    CSPURL_LOCALHOST,
    CSP.UNSAFE_EVAL,
    CSP.UNSAFE_INLINE,
]
