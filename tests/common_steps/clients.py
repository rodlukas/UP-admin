from behave import *
from admin.models import Client
from tests import helpers


@given("the database with two clients")
def step_impl(context):
    helpers.add_two_clients()
    assert Client.objects.count() == 2
