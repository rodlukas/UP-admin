from behave import when, then, use_step_matcher
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

from tests import common_helpers

# noinspection PyUnresolvedReferences
from tests.common_steps import attendancestates

# noinspection PyUnresolvedReferences
from tests.ui_steps import helpers, login_logout


def get_attendancestates(driver):
    return driver.find_elements(By.CSS_SELECTOR, "[data-qa=attendancestate]")


def attendancestates_cnt(driver):
    return len(get_attendancestates(driver))


def find_attendancestate(context, name, **data):
    all_attendancestates = get_attendancestates(context.browser)
    # najdi stav ucasti s udaji v parametrech
    for attendancestate in all_attendancestates:
        found_name = attendancestate.find_element(
            By.CSS_SELECTOR, "[data-qa=attendancestate_name]"
        ).text
        # srovnej identifikatory
        if found_name == name:
            found_visible_classes = attendancestate.find_element(
                By.CSS_SELECTOR, "[data-qa=attendancestate_visible]"
            ).get_attribute("class")
            # identifikatory sedi, otestuj pripadna dalsi zaslana data nebo rovnou vrat nalezeny prvek
            if not data or (data and helpers.check_fa_bool(data["visible"], found_visible_classes)):
                # uloz stara data do kontextu pro pripadne overeni spravnosti
                context.old_name = found_name
                context.old_visible = helpers.convert_fa_bool(found_visible_classes)
                return attendancestate
    return False


def find_attendancestate_with_context(context):
    return find_attendancestate(context, context.name, visible=context.visible)


def insert_to_form(context, verify_current_data=False):
    # pockej az bude viditelny formular
    helpers.wait_form_settings_visible(context.browser)
    # priprav pole z formulare
    name_field = context.browser.find_element(By.CSS_SELECTOR, "[data-qa=settings_field_name]")
    visible_checkbox = context.browser.find_element(
        By.CSS_SELECTOR, "[data-qa=settings_checkbox_visible]"
    )
    visible_label = context.browser.find_element(
        By.CSS_SELECTOR, "[data-qa=settings_label_visible]"
    )
    # over, ze aktualne zobrazene udaje ve formulari jsou spravne
    if verify_current_data:
        assert (
            context.old_name == name_field.get_attribute("value")
            and context.old_visible == visible_checkbox.is_selected()
        )
    # smaz vsechny udaje
    name_field.clear()
    # vloz nove udaje
    if (context.visible and not visible_checkbox.is_selected()) or (
        not context.visible and visible_checkbox.is_selected()
    ):
        visible_label.click()
    name_field.send_keys(context.name)


def load_data_to_context(context, name, visible):
    load_id_data_to_context(context, name)
    context.visible = common_helpers.to_bool(visible)


def load_id_data_to_context(context, name):
    context.name = name


def save_old_attendancestates_cnt_to_context(context):
    context.old_attendancestates_cnt = attendancestates_cnt(context.browser)


@then("the attendance state is added")
def step_impl(context):
    # pockej az bude modalni okno kompletne zavrene
    helpers.wait_modal_closed(context.browser)
    # pockej na pridani stavu ucasti
    WebDriverWait(context.browser, helpers.WAIT_TIME).until(
        lambda driver: find_attendancestate_with_context(context)
    )
    # over, ze sedi pocet stavu ucasti
    assert attendancestates_cnt(context.browser) > context.old_attendancestates_cnt


@then("the attendance state is updated")
def step_impl(context):
    # pockej az bude modalni okno kompletne zavrene
    helpers.wait_modal_closed(context.browser)
    # pockej na update stavu ucasti
    WebDriverWait(context.browser, helpers.WAIT_TIME).until(
        lambda driver: find_attendancestate_with_context(context)
    )
    # over, ze sedi pocet stavu ucasti
    assert attendancestates_cnt(context.browser) == context.old_attendancestates_cnt


@then("the attendance state is deleted")
def step_impl(context):
    # pockej az bude modalni okno kompletne zavrene
    helpers.wait_modal_closed(context.browser)
    # pockej na smazani stavu ucasti
    WebDriverWait(context.browser, helpers.WAIT_TIME).until(
        lambda driver: not find_attendancestate(context, context.name)
    )
    # over, ze sedi pocet stavu ucasti
    assert attendancestates_cnt(context.browser) < context.old_attendancestates_cnt


@when('user deletes the attendance state "{name}"')
def step_impl(context, name):
    # nacti jmeno stavu ucasti do kontextu
    load_id_data_to_context(context, name)
    # klikni v menu na nastaveni
    helpers.open_settings(context.browser)
    # pockej na nacteni
    helpers.wait_loading_ends(context.browser)
    # najdi stav ucasti a klikni u nej na Upravit
    attendancestate_to_update = find_attendancestate(context, context.name)
    assert attendancestate_to_update
    button_edit_attendancestate = attendancestate_to_update.find_element(
        By.CSS_SELECTOR, "[data-qa=button_edit_attendancestate]"
    )
    button_edit_attendancestate.click()
    # uloz puvodni pocet stavu ucasti
    save_old_attendancestates_cnt_to_context(context)
    # pockej az bude viditelny formular
    helpers.wait_form_settings_visible(context.browser)
    # klikni na smazat
    button_delete_attendancestate = context.browser.find_element(
        By.CSS_SELECTOR, "[data-qa=settings_button_delete]"
    )
    button_delete_attendancestate.click()
    # a potvrd smazani
    helpers.wait_for_alert_and_accept(context.browser)


@then("the attendance state is not added")
def step_impl(context):
    try:
        WebDriverWait(context.browser, helpers.WAIT_TIME_SHORT).until_not(
            EC.presence_of_element_located((By.CSS_SELECTOR, "[data-qa=form_settings]"))
        )
        form_attendancestate_visible = False
    except TimeoutException:
        form_attendancestate_visible = True
    assert form_attendancestate_visible
    assert attendancestates_cnt(context.browser) == context.old_attendancestates_cnt


@when(
    'user updates the data of attendance state "{cur_name}" to name "{new_name}" and visibility "{new_visible}"'
)
def step_impl(context, cur_name, new_name, new_visible):
    # nacti data stavu ucasti do kontextu
    load_data_to_context(context, new_name, new_visible)
    # klikni v menu na nastaveni
    helpers.open_settings(context.browser)
    # pockej na nacteni
    helpers.wait_loading_ends(context.browser)
    # najdi stav ucasti a klikni u nej na Upravit
    attendancestate_to_update = find_attendancestate(context, cur_name)
    assert attendancestate_to_update
    button_edit_attendancestate = attendancestate_to_update.find_element(
        By.CSS_SELECTOR, "[data-qa=button_edit_attendancestate]"
    )
    button_edit_attendancestate.click()
    # uloz puvodni pocet stavu ucasti
    save_old_attendancestates_cnt_to_context(context)
    # over spravne zobrazene udaje ve formulari a vloz do nej vsechny udaje
    insert_to_form(context, True)
    # odesli formular
    helpers.submit_form(context, "button_submit_settings")


use_step_matcher("re")


@when('user adds new attendance state "(?P<name>.*)" with visibility "(?P<visible>.*)"')
def step_impl(context, name, visible):
    # nacteni dat stavu ucasti do kontextu
    load_data_to_context(context, name, visible)
    # klikni v menu na nastaveni
    helpers.open_settings(context.browser)
    # pockej na nacteni a pak klikni na Pridat stav ucasti
    helpers.wait_loading_ends(context.browser)
    button_add_attendancestate = context.browser.find_element(
        By.CSS_SELECTOR, "[data-qa=button_add_attendancestate]"
    )
    button_add_attendancestate.click()
    # uloz puvodni pocet stavu ucasti
    save_old_attendancestates_cnt_to_context(context)
    # vloz vsechny udaje do formulare
    insert_to_form(context)
    # odesli formular
    helpers.submit_form(context, "button_submit_settings")
