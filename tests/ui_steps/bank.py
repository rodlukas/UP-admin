from behave import when, then
from selenium.webdriver.common.by import By

# noinspection PyUnresolvedReferences
from tests.common_steps import bank as bank_common

# noinspection PyUnresolvedReferences
from tests.ui_steps import helpers, login_logout


@when("user opens the dashboard")
def step_impl(context):
    helpers.wait_loading_ends(context.browser)


@then("the dashboard shows that the bank connection is disabled")
def step_impl(context):
    error = helpers.wait(context.browser, helpers.WAIT_TIME).until(
        lambda driver: driver.find_element(By.CSS_SELECTOR, "[data-qa=bank_error]")
    )
    assert "zakázáno" in error.text
