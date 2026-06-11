from rest_framework.test import APIClient

from tests import fixtures


def before_all(context):
    context.api_client = APIClient()


def before_scenario(context, scenario):
    # scenare s tagem @ui_only overuji cistne frontendove chovani bez API
    # (napr. prepinani barevneho schematu) - v API stage nemaji kroky definovane, preskoc je
    if "ui_only" in scenario.effective_tags:
        scenario.skip(reason="scenar je urceny jen pro UI stage (--stage=ui)")
        return
    context.user = fixtures.user()
