from behave import *
from django.contrib.auth import get_user_model


@given('the database with user')
def step_impl(context):
    assert get_user_model().objects.count() > 0


@given('the logged user')
def step_impl(context):
    context.execute_steps('''
    When user logs into app with correct credentials
    Then user is logged into app
    ''')
