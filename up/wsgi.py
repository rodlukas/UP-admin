"""
WSGI config for up project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/2.0/howto/deployment/wsgi/
"""

import os
from django.core.wsgi import get_wsgi_application
from whitenoise.django import DjangoWhiteNoise
from raven.contrib.django.raven_compat.middleware.wsgi import Sentry

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "up.production_settings")

application = get_wsgi_application()
application = Sentry(application)
application = DjangoWhiteNoise(application)
