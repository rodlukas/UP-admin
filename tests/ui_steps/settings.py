from behave import when, then
from selenium.webdriver.common.by import By

from tests.ui_steps import helpers

# noinspection PyUnresolvedReferences
from tests.ui_steps import login_logout


def open_settings_page(context):
    helpers.open_settings(context.browser)
    helpers.wait_loading_ends(context.browser)


def select_attendance_state(driver, field_id, name):
    # Select neni vyhledavaci (viz Settings.tsx) - stejny vzor jako vyber stavu ucasti
    # lekce (lectures.py choose_attendancestate): klikni na pole pro otevreni dropdownu,
    # pak klikni na volbu s presne odpovidajicim textem
    field = driver.find_element(By.ID, field_id)
    field.click()
    options = helpers.wait_combobox_options(driver)
    matched = next((option for option in options if option.text == name), None)
    assert matched is not None, f"Stav '{name}' nebyl v nabidce nalezen"
    matched.click()


def assert_state_after_reload(context, field_id, name):
    # reload by rozdelanou mutaci zrusil - pockej na potvrzeni ulozeni
    helpers.wait_notification(context.browser, "Změna konfigurace stavů účasti uložena")
    context.browser.refresh()
    helpers.wait_loading_ends(context.browser)
    # pole se po reloadu znovu vytvari - hledej ho znovu pri kazdem pokusu, ne jen jednou
    # pred cekanim (jinak StaleElementReferenceException)
    helpers.wait(context.browser, helpers.WAIT_TIME).until(
        lambda driver: driver.find_element(By.ID, field_id).get_attribute("value") == name
    )


@when('user sets the default attendance state to "{name}" in settings')
def step_impl(context, name):
    open_settings_page(context)
    select_attendance_state(context.browser, "state_default_id", name)


@when('user sets the excused attendance state to "{name}" in settings')
def step_impl(context, name):
    open_settings_page(context)
    select_attendance_state(context.browser, "state_excused_id", name)


@then('the default attendance state is "{name}" after a reload')
def step_impl(context, name):
    assert_state_after_reload(context, "state_default_id", name)


@then('the excused attendance state is "{name}" after a reload')
def step_impl(context, name):
    assert_state_after_reload(context, "state_excused_id", name)
