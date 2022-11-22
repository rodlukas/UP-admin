#!/usr/bin/env python
"""
Django CLI utilita pro správu up aplikace.
"""
import os
import sys

if __name__ == "__main__":
    # nastaveni vychoziho souboru s nastavenim
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "up.settings.local")
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)
