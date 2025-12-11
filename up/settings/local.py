"""
Lokální (vývojová) konfigurace Django projektu.
Rozšiřuje základní konfiguraci ze souboru base.py.
"""

from .base import *

# Django konstanty
ALLOWED_HOSTS = ["*"]

# CSP
CSPURL_LOCALHOST = ("http://*:3000",)

CSP_STYLE_SRC = CSP_STYLE_SRC + CSPURL_LOCALHOST  # type: ignore[assignment]
CSP_CONNECT_SRC = CSP_CONNECT_SRC + CSPURL_LOCALHOST + ("ws://*:3000",)  # type: ignore[assignment]
CSP_SCRIPT_SRC = CSP_SCRIPT_SRC + CSPURL_LOCALHOST + ("'unsafe-eval'", "'unsafe-inline'")  # type: ignore[assignment]
