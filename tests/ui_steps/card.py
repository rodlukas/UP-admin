from behave import when, then
from selenium.common.exceptions import NoSuchElementException, StaleElementReferenceException
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC

from tests.ui_steps import flows
from tests.ui_steps import helpers

# noinspection PyUnresolvedReferences
from tests.ui_steps import login_logout

client_ui = flows.client_ui
group_ui = flows.group_ui
lecture_ui = flows.lecture_ui


@when('user changes the phone of "{full_name}" on her card to "{new_phone}"')
def step_impl(context, full_name, new_phone):
    lecture_ui.open_client_card(context, full_name)
    helpers.wait_loading_ends(context.browser)
    client_ui.set_phone_on_open_card(context, new_phone)


@when('user deletes "{full_name}" from her card')
@when('user tries to delete "{full_name}" from her card')
def step_impl(context, full_name):
    lecture_ui.open_client_card(context, full_name)
    helpers.wait_loading_ends(context.browser)
    client_ui.delete_client_on_open_card(context)


@then("the deletion is refused because the client has lectures")
def step_impl(context):
    helpers.wait_notification(context.browser, "Klienta lze smazat jen pokud nemá žádné lekce.")
    # odmitnute mazani formular nezavre
    assert helpers.is_modal_open(context.browser)


@when('user renames group "{old_name}" to "{new_name}" on its card')
def step_impl(context, old_name, new_name):
    lecture_ui.open_group_card(context, old_name)
    helpers.wait_loading_ends(context.browser)
    context.browser.find_element(By.CSS_SELECTOR, "[data-qa=button_edit_group]").click()
    group_ui.wait_form_visible(context.browser)
    name_field = context.browser.find_element(By.CSS_SELECTOR, "[data-qa=group_field_name]")
    helpers.clear_input(name_field)
    name_field.send_keys(new_name)
    helpers.submit_form(context, "button_submit_group")
    helpers.wait_modal_closed(context.browser)
    helpers.wait_loading_ends(context.browser)


@then('the open card shows group name "{expected_name}"')
def step_impl(context, expected_name):
    helpers.wait(context.browser, helpers.WAIT_TIME).until(
        lambda driver: helpers.heading_text(driver, "group_name") == expected_name
    )


@when('user deletes group "{name}" from its card')
def step_impl(context, name):
    lecture_ui.open_group_card(context, name)
    helpers.wait_loading_ends(context.browser)
    context.browser.find_element(By.CSS_SELECTOR, "[data-qa=button_edit_group]").click()
    group_ui.wait_form_visible(context.browser)
    context.browser.find_element(By.CSS_SELECTOR, "[data-qa=button_delete_group]").click()
    helpers.wait_for_alert_and_accept(context.browser)


@then('the group "{name}" is gone from the list')
def step_impl(context, name):
    helpers.wait_modal_closed(context.browser)
    # smazani z karty navic navaze na seznam skupin (SPA navigace) - prepinac
    # aktivni/neaktivni, na ktery sahne find_group, tak chvili po prechodu nemusi
    # jeste v DOM byt (nebo zase zmizi pri doprovodnem prekresleni); dalsi pokus to zopakuje
    helpers.wait(
        context.browser,
        helpers.WAIT_TIME,
        ignored_exceptions=(NoSuchElementException, StaleElementReferenceException),
    ).until(lambda driver: not helpers.find_group(context, name))
    # karta smazane skupiny se jeste dotaze na jeji lekce - nesmi skoncit chybou
    helpers.assert_only_notifications(context.browser, {"Skupina smazána"})


@when('user deactivates "{full_name}" from her card')
def step_impl(context, full_name):
    lecture_ui.open_client_card(context, full_name)
    helpers.wait_loading_ends(context.browser)
    context.browser.find_element(By.CSS_SELECTOR, "[data-qa=button_deactivate]").click()
    helpers.wait_for_alert_and_accept(context.browser)


@then("the open card says the client is inactive")
def step_impl(context):
    helpers.wait(context.browser, helpers.WAIT_TIME).until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, "[data-qa=card_inactive_notice]"))
    )


@when('user opens the analysis of "{full_name}"')
def step_impl(context, full_name):
    lecture_ui.open_client_card(context, full_name)
    helpers.wait_loading_ends(context.browser)
    context.browser.find_element(By.CSS_SELECTOR, "[data-qa=card_tab_analysis]").click()


@then("the analysis shows a chart")
def step_impl(context):
    helpers.wait(context.browser, helpers.WAIT_TIME).until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, "[data-qa=client_analysis_chart]"))
    )


@when('user opens the card of "{full_name}"')
def step_impl(context, full_name):
    lecture_ui.open_client_card(context, full_name)
    helpers.wait_loading_ends(context.browser)


@then("the card has no deactivate button")
def step_impl(context):
    assert len(context.browser.find_elements(By.CSS_SELECTOR, "[data-qa=button_deactivate]")) == 0
