from rest_framework.test import APIClient


def before_all(context):
    context.client = APIClient()
