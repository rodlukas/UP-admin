from rest_framework.test import APIClient

from tests import fixtures


def before_all(context):
    context.api_client = APIClient()


def before_scenario(context, scenario):
    context.user = fixtures.user()
