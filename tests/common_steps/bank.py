from behave import given

from api.tests.fio import fio_response, fio_statement, fio_transaction
from tests.bank_override import use_bank


@given("the bank connection is turned off")
def step_impl(context):
    use_bank(context, BANK_ACTIVE=False)


@given(
    "the bank reports balance {balance:d} CZK, rent {rent:d} CZK"
    ' and a payment of {amount:d} CZK noted "{note}"'
)
def step_impl(context, balance, rent, amount, note):
    statement = fio_statement(balance, [fio_transaction(1, amount, note, "2026-10-20+0200")])
    use_bank(
        context,
        fio_response(200, statement),
        BANK_ACTIVE=True,
        FIO_API_KEY="test-token",
        BANK_RENT_PRICE=rent,
    )


@given("the bank answers with error status {status_code:d}")
def step_impl(context, status_code):
    use_bank(context, fio_response(status_code, b""), BANK_ACTIVE=True, FIO_API_KEY="test-token")
