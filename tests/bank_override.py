"""Nastaveni banky pro E2E testy - skutecne Fio API se v testech nevola nikdy.

Lokalni .env muze mit BANK_ACTIVE=True a ostry FIO_API_KEY; Prehled nacita banku hned po
prihlaseni, takze bez vychoziho vypnuti (viz `block_real_bank` v api/ui_environment.py)
by kazdy UI scenar poslal skutecny dotaz do banky.
"""

from unittest import mock

from django.core.cache import cache
from django.test import override_settings

from api.services import FIO_CACHE_KEY


def use_bank(context, response=None, error=None, **overrides):
    """Prepne nastaveni banky a podvrhne odpoved Fio API; plati i pro live server UI stage.

    Vola se z hooku (cela sada) i z kroku (jeden scenar) - uklid zajisti `context.add_cleanup`
    na prislusne urovni.
    """
    override = override_settings(**overrides)
    override.enable()
    context.add_cleanup(override.disable)
    patcher = mock.patch("api.services.requests.get", return_value=response, side_effect=error)
    patcher.start()
    context.add_cleanup(patcher.stop)
    # uspesny vypis se cachuje - scenar nesmi dostat vypis z predchoziho
    cache.delete(FIO_CACHE_KEY)
    context.add_cleanup(cache.delete, FIO_CACHE_KEY)


def block_real_bank(context):
    use_bank(
        context,
        error=AssertionError("E2E testy nesmi volat skutecne Fio API"),
        BANK_ACTIVE=False,
    )
