from behave import when, then
from selenium.common.exceptions import StaleElementReferenceException
from selenium.webdriver.common.by import By

# noinspection PyUnresolvedReferences
from tests.ui_steps import helpers, login_logout


def stat_total(driver, qa):
    return driver.find_element(By.CSS_SELECTOR, f"[data-qa={qa}] [data-qa=stat_total]").text


@when("user opens the statistics page")
def step_impl(context):
    context.browser.find_element(By.CSS_SELECTOR, "[data-qa=menu_statistics]").click()


@then("the statistics page shows {clients:d} clients and {groups:d} groups")
def step_impl(context, clients, groups):
    helpers.wait(
        context.browser, helpers.WAIT_TIME, ignored_exceptions=(StaleElementReferenceException,)
    ).until(
        lambda driver: stat_total(driver, "stat_card_clients") == str(clients)
        and stat_total(driver, "stat_card_groups") == str(groups)
    )
