from behave import when, then
from rest_framework import status

from tests.api_steps import helpers

# noinspection PyUnresolvedReferences
from tests.common_steps import bank as bank_common, login_logout


@when("user requests the bank statement")
def step_impl(context):
    context.resp = context.api_client.get(helpers.API_BANK)


@then("the bank connection is reported as disabled")
def step_impl(context):
    assert context.resp.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
    error_info = context.resp.json()["error_info"]
    assert "zakázáno" in error_info
