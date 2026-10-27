import re

from behave import given, when, then
from selenium.webdriver.common.by import By

from api.tests.fio import fio_response, fio_statement, fio_transaction
from tests.bank_override import use_bank

# noinspection PyUnresolvedReferences
from tests.ui_steps import helpers, login_logout


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


@when("user opens the dashboard")
def step_impl(context):
    # po prihlaseni je uzivatel na Prehledu, banku nacita sam
    helpers.wait_visible(context.browser, "bank")


@then("the dashboard shows that the bank connection is disabled")
def step_impl(context):
    assert "zakázáno" in helpers.wait_visible(context.browser, "bank_error").text


@then('the dashboard shows balance {balance:d} CZK and the payment "{note}" without a rent warning')
def step_impl(context, balance, note):
    # castka je formatovana pro cestinu ("12 000 Kč") - porovnavaji se jen cislice
    balance_text = helpers.wait_visible(context.browser, "bank_balance").text
    assert re.sub(r"\D", "", balance_text) == str(balance), balance_text
    rows = context.browser.find_elements(By.CSS_SELECTOR, "[data-qa=bank_transaction]")
    assert [
        row.find_element(By.CSS_SELECTOR, "[data-qa=bank_account_owner]").text for row in rows
    ] == [note]
    assert not context.browser.find_elements(By.CSS_SELECTOR, "[data-qa=bank_rent_warning]")


@then("the dashboard warns that the balance does not cover the rent")
def step_impl(context):
    helpers.wait_visible(context.browser, "bank_balance")
    assert context.browser.find_elements(By.CSS_SELECTOR, "[data-qa=bank_rent_warning]")
