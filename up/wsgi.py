"""
WSGI konfigurace pro up projekt - vystaví objekt aplikace pro komunikaci mezi web serverem a webovou aplikací.
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "up.settings")

application = get_wsgi_application()
