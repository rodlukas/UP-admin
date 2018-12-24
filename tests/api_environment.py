from rest_framework.test import APIClient
from tests import helpers


def before_all(context):
    context.client = APIClient()


def before_scenario(context, scenario):
    context.user = helpers.add_user()
