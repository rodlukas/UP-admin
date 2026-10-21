from behave import when, then
from selenium.webdriver.common.by import By

from tests.ui_steps import flows
from tests.ui_steps import helpers

# noinspection PyUnresolvedReferences
from tests.ui_steps import login_logout

application_ui = flows.application_ui
group_ui = flows.group_ui


@when(
    'user adds group "{name}" in course "{course_name}" with a new client "{firstname}" "{surname}"'
)
def step_impl(context, name, course_name, firstname, surname):
    helpers.open_groups(context.browser)
    helpers.wait_loading_ends(context.browser)
    context.browser.find_element(By.CSS_SELECTOR, "[data-qa=button_add_group]").click()
    flows.fill_group_form_with_new_client(context, name, course_name, firstname, surname)
    helpers.submit_form(context, "button_submit_group")
    helpers.wait_modal_closed(context.browser)
    helpers.wait_loading_ends(context.browser)


@then('the group "{name}" has member "{full_name}"')
def step_impl(context, name, full_name):
    found_group = helpers.find_group(context, name, open_card=True)
    assert found_group
    helpers.wait_loading_ends(context.browser)
    helpers.wait(context.browser, helpers.WAIT_TIME).until(
        lambda driver: any(
            element.text == full_name
            for element in driver.find_elements(By.CSS_SELECTOR, "[data-qa=client_name]")
        )
    )


@when(
    'user adds an applicant "{firstname}" "{surname}" for course "{course_name}" with note "{note}"'
)
def step_impl(context, firstname, surname, course_name, note):
    application_ui.open_applications(context.browser)
    helpers.wait_loading_ends(context.browser)
    context.browser.find_element(By.CSS_SELECTOR, "[data-qa=button_add_application]").click()
    application_ui.wait_form_visible(context.browser)
    flows.add_client_in_open_form(context, firstname, surname, "", "", "")
    course_field = context.browser.find_element(By.ID, "course")
    assert helpers.combobox_insert(context.browser, course_field, course_name)
    note_field = context.browser.find_element(By.CSS_SELECTOR, "[data-qa=application_field_note]")
    note_field.send_keys(note)
    helpers.submit_form(context, "button_submit_application")
    helpers.wait_modal_closed(context.browser)
    helpers.wait_loading_ends(context.browser)


@then('the applicant "{full_name}" for course "{course_name}" is on the list')
def step_impl(context, full_name, course_name):
    helpers.wait(context.browser, helpers.WAIT_TIME).until(
        lambda driver: application_ui.find_application(context, full_name, course_name)
    )
