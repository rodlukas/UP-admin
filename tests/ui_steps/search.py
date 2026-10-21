from behave import when, then
from selenium.webdriver.common.by import By

from tests.ui_steps import flows
from tests.ui_steps import helpers

# noinspection PyUnresolvedReferences
from tests.ui_steps import login_logout

client_ui = flows.client_ui


@when('user searches and opens "{label}"')
def step_impl(context, label):
    flows.spotlight_pick(context.browser, label)
    helpers.wait_loading_ends(context.browser)


@when('user searches for "{query}" and opens "{result_label}"')
def step_impl(context, query, result_label):
    flows.spotlight_pick(context.browser, query, result_label)
    helpers.wait_loading_ends(context.browser)


@then('the client card of "{full_name}" is open')
def step_impl(context, full_name):
    helpers.wait(context.browser, helpers.WAIT_TIME).until(
        lambda driver: helpers.heading_text(driver, "client_name") == full_name
    )


@then('the group card of "{name}" is open')
def step_impl(context, name):
    helpers.wait(context.browser, helpers.WAIT_TIME).until(
        lambda driver: helpers.heading_text(driver, "group_name") == name
    )


@when('user searches for "{query}"')
def step_impl(context, query):
    field = flows.open_spotlight(context.browser)
    field.send_keys(query)


@then("the search shows no results")
def step_impl(context):
    helpers.wait(context.browser, helpers.WAIT_TIME).until(
        lambda driver: driver.find_element(By.CSS_SELECTOR, "[data-qa=spotlight_empty]").text
        == "Žádné výsledky odpovídající dotazu."
    )


@when('user changes the phone on the open card to "{new_phone}"')
def step_impl(context, new_phone):
    client_ui.set_phone_on_open_card(context, new_phone)


@when("user deletes the client on the open card")
def step_impl(context):
    client_ui.delete_client_on_open_card(context)
