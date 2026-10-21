from behave import when, then
from selenium.webdriver.common.by import By

# noinspection PyUnresolvedReferences
from tests.ui_steps import helpers, login_logout


def stat_total(driver, title):
    card = driver.find_element(By.CSS_SELECTOR, f"[data-qa=stat_card][data-title='{title}']")
    return card.find_element(By.CSS_SELECTOR, "[data-qa=stat_total]").text


@when("user opens the statistics page")
def step_impl(context):
    context.browser.find_element(By.CSS_SELECTOR, "[data-qa=menu_statistics]").click()
    helpers.wait_loading_ends(context.browser)


@then("the statistics page shows {clients:d} clients and {groups:d} groups")
def step_impl(context, clients, groups):
    assert stat_total(context.browser, "Klienti") == str(clients)
    assert stat_total(context.browser, "Skupiny") == str(groups)
