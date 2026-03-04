"""
Lokální (vývojová) konfigurace Django projektu.
Rozšiřuje základní konfiguraci ze souboru base.py.
"""

from .base import *

# Django konstanty
ALLOWED_HOSTS = ["*"]

# CSP
CSPURL_LOCALHOST = "http://*:3000"

SECURE_CSP["style-src"] = [v for v in SECURE_CSP["style-src"] if v != CSP.NONCE] + [
    CSP.UNSAFE_INLINE,
    CSPURL_LOCALHOST,
]
SECURE_CSP["connect-src"] = SECURE_CSP["connect-src"] + [CSPURL_LOCALHOST, "ws://*:3000"]
SECURE_CSP["script-src"] = [v for v in SECURE_CSP["script-src"] if v != CSP.NONCE] + [
    CSP.UNSAFE_INLINE,
    CSP.UNSAFE_EVAL,
    CSPURL_LOCALHOST,
]
