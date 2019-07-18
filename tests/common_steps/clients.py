from behave import *

from admin.models import Client
from .. import fixtures


@given('the database with some clients')
def step_impl(context):
    fixtures.clients()
    assert Client.objects.count() > 0
