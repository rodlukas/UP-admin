"""Nastaveni banky pro E2E testy - skutecne Fio API se v testech nevola nikdy.

Lokalni .env muze mit BANK_ACTIVE=True a ostry FIO_API_KEY; Prehled nacita banku hned po
prihlaseni, takze bez vychoziho vypnuti (`block_real_bank` v api_environment.py a
ui_environment.py) by kazdy UI scenar poslal skutecny dotaz do banky.
"""

from unittest import mock
from urllib.parse import urlsplit

from django.core.cache import cache
from django.test import override_settings
from requests.adapters import HTTPAdapter

from api.services import FIO_CACHE_KEY


def _add_cleanup(context, func, *args):
    # Ve scenari se uklizi spolu s live serverem (class cleanup behave-django testu, LIFO
    # vuci jeho modify_settings) - context.add_cleanup by bezel az po nem a vratil by
    # settings na stav s jeho uz zrusenou upravou. Mimo scenar (before_all) uklizi behave.
    if hasattr(context, "test"):
        context.test.__class__.addClassCleanup(func, *args)
    else:
        context.add_cleanup(func, *args)


def use_bank(context, response=None, **overrides):
    """Prepne nastaveni banky; s `response` navic podvrhne odpoved Fio API.

    Nastaveni i podvrzena odpoved plati i pro live server UI stage (stejny proces).
    """
    override = override_settings(**overrides)
    override.enable()
    _add_cleanup(context, override.disable)
    if response is not None:
        patcher = mock.patch("api.services.requests.get", return_value=response)
        patcher.start()
        _add_cleanup(context, patcher.stop)
    # uspesny vypis se cachuje - scenar nesmi dostat vypis z predchoziho
    cache.delete(FIO_CACHE_KEY)
    _add_cleanup(context, cache.delete, FIO_CACHE_KEY)


def block_real_bank(context):
    """Pro celou sadu vypne banku a zablokuje kazdy HTTP pozadavek pres `requests`."""
    use_bank(context, BANK_ACTIVE=False)
    patcher = mock.patch.object(
        HTTPAdapter, "send", side_effect=AssertionError("E2E testy nesmi volat skutecne Fio API")
    )
    context.real_request_guard = patcher.start()
    context.add_cleanup(patcher.stop)


def assert_no_real_request(context):
    # vyjimka z pojistky v live serveru UI stage skonci jen chybou 500 v prohlizeci
    # (bankovni chyby frontend neoznamuje) - proto se pokus overuje az tady
    attempts = [call.args[0] for call in context.real_request_guard.call_args_list]
    # URL Fio API nese v ceste API klic - vypisuje se jen metoda a hostitel
    assert not attempts, "E2E testy se pokusily o skutecny HTTP pozadavek: " + ", ".join(
        f"{request.method} {urlsplit(request.url).netloc}" for request in attempts
    )
