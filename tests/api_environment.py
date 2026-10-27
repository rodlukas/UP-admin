from rest_framework.test import APIClient

from tests import fixtures
from tests.bank_override import assert_no_real_request, block_real_bank


def before_all(context):
    block_real_bank(context)
    context.api_client = APIClient()


def after_all(context):
    assert_no_real_request(context)


def before_scenario(context, scenario):
    # scenare s tagem @ui_only overuji cistne frontendove chovani bez API
    # (napr. prepinani barevneho schematu) - v API stage nemaji kroky definovane, preskoc je
    if "ui_only" in scenario.effective_tags:
        scenario.skip(reason="scenar je urceny jen pro UI stage (--stage=ui)")
        return
    context.user = fixtures.user()
