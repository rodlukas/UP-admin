from behave import when, then
from selenium.common.exceptions import StaleElementReferenceException
from selenium.webdriver.common.by import By

from tests.ui_steps import flows
from tests.ui_steps import helpers

# noinspection PyUnresolvedReferences
from tests.ui_steps import login_logout

client_ui = flows.client_ui


def open_from_search(context, query, result_label):
    flows.spotlight_pick(context.browser, query, result_label)
    # karta se otevira SPA navigaci - nasledne kroky nad kartou musi pockat na jeji nadpis
    helpers.wait_page_title(context.browser, lambda title: result_label in title)
    helpers.wait_loading_ends(context.browser)


@when('user searches and opens "{label}"')
def step_impl(context, label):
    open_from_search(context, label, label)


@when('user searches for "{query}" and opens "{result_label}"')
def step_impl(context, query, result_label):
    open_from_search(context, query, result_label)


@then('the client card of "{full_name}" is open')
def step_impl(context, full_name):
    helpers.wait_card_heading(context.browser, "client_name", full_name)


@then('the group card of "{name}" is open')
def step_impl(context, name):
    helpers.wait_card_heading(context.browser, "group_name", name)


@when('user types "{query}" into the search')
def step_impl(context, query):
    field = flows.open_spotlight(context.browser)
    field.send_keys(query)


@then("the search shows no results")
def step_impl(context):
    helpers.wait(
        context.browser, helpers.WAIT_TIME, ignored_exceptions=(StaleElementReferenceException,)
    ).until(
        lambda driver: driver.find_element(By.CSS_SELECTOR, "[data-qa=spotlight_empty]").text
        == "Žádné výsledky odpovídající dotazu."
    )


@when('user changes the phone on the open card to "{new_phone}"')
def step_impl(context, new_phone):
    client_ui.set_phone_on_open_card(context, new_phone)


@when("user deletes the client on the open card")
def step_impl(context):
    client_ui.delete_client_on_open_card(context)
