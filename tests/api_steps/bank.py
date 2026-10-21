from behave import given, when, then
from rest_framework import status

from api.tests.fio import fio_response
from tests.api_steps import helpers
from tests.bank_override import use_bank

# noinspection PyUnresolvedReferences
from tests.common_steps import bank as bank_common, login_logout


@given("the bank answers with error status {status_code:d}")
def step_impl(context, status_code):
    use_bank(context, fio_response(status_code, b""), BANK_ACTIVE=True, FIO_API_KEY="test-token")


@when("user requests the bank statement")
def step_impl(context):
    context.resp = context.api_client.get(helpers.API_BANK)


@then("the bank connection is reported as disabled")
def step_impl(context):
    assert context.resp.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
    assert "zakázáno" in context.resp.json()["error_info"]


@then(
    "the bank statement shows balance {balance:d} CZK, rent {rent:d} CZK"
    ' and the payment "{note}"'
)
def step_impl(context, balance, rent, note):
    assert context.resp.status_code == status.HTTP_200_OK
    data = context.resp.json()
    assert data["accountStatement"]["info"]["closingBalance"] == balance
    assert data["rent_price"] == rent
    transactions = data["accountStatement"]["transactionList"]["transaction"]
    assert [t["column25"]["value"] for t in transactions] == [note]


@then('the bank reports the error "{message}"')
def step_impl(context, message):
    assert context.resp.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
    assert message in context.resp.json()["error_info"]
