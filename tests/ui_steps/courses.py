from behave import *
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.common.exceptions import TimeoutException
from tests.ui_steps import helpers
from tests import common_helpers
from tests.common_steps import courses
from tests.ui_steps import login_logout


def get_courses(driver):
    return driver.find_elements_by_css_selector('[data-qa=course]')


def courses_cnt(driver):
    return len(get_courses(driver))


def find_course(driver, name, **data):
    all_courses = get_courses(driver)
    # najdi kurz s udaji v parametrech
    for course in all_courses:
        found_name = course.find_element_by_css_selector('[data-qa=course_name]').text
        # srovnej identifikatory
        if found_name == name:
            # identifikatory sedi, otestuj pripadna dalsi zaslana data nebo rovnou vrat nalezeny prvek
            if data:
                found_visible_classes = course.find_element_by_css_selector(
                    '[data-qa=course_visible]').get_attribute('class')
                if helpers.check_fa_bool(data['visible'], found_visible_classes):
                    return course
            else:
                return course
    return False


def find_course_with_context(context):
    return find_course(context.browser, context.name, visible=context.visible)


def insert_to_form(context):
    # pockej az bude viditelny formular
    helpers.wait_form_settings_visible(context.browser)
    # vloz vsechny udaje do formulare
    name_field = context.browser.find_element_by_css_selector('[data-qa=settings_field_name]')
    visible_checkbox = context.browser.find_element_by_css_selector('[data-qa=settings_checkbox_visible]')
    visible_label = context.browser.find_element_by_css_selector('[data-qa=settings_label_visible]')
    # smaz vsechny udaje
    name_field.clear()
    # vloz nove udaje
    if ((context.visible and not visible_checkbox.is_selected()) or
            (not context.visible and visible_checkbox.is_selected())):
        visible_label.click()
    name_field.send_keys(context.name)
    # vrat posledni element
    return visible_checkbox


def load_data_to_context(context, name, visible):
    load_id_data_to_context(context, name)
    context.visible = common_helpers.to_bool(visible)


def load_id_data_to_context(context, name):
    context.name = name


def save_old_courses_cnt_to_context(context):
    context.old_courses_cnt = courses_cnt(context.browser)


@then('the course is added')
def step_impl(context):
    # pockej na pridani kurzu
    WebDriverWait(context.browser, helpers.WAIT_TIME).until(
        lambda driver: courses_cnt(driver) > context.old_courses_cnt)
    # je kurz opravdu pridany?
    assert find_course_with_context(context)


@then('the course is updated')
def step_impl(context):
    # pockej na update kurzu
    helpers.wait_loading_cycle(context.browser)
    # ma kurz opravdu nove udaje?
    assert find_course_with_context(context)
    assert courses_cnt(context.browser) == context.old_courses_cnt


@then('the course is deleted')
def step_impl(context):
    # pockej na smazani kurzu
    WebDriverWait(context.browser, helpers.WAIT_TIME).until(
        lambda driver: courses_cnt(driver) < context.old_courses_cnt)
    # je kurz opravdu smazany?
    assert not find_course(context.browser, context.name)


@when('user deletes the course "{name}"')
def step_impl(context, name):
    # nacti jmeno kurzu do kontextu
    load_id_data_to_context(context, name)
    # klikni v menu na nastaveni
    helpers.open_settings(context.browser)
    # pockej na nacteni
    helpers.wait_loading_ends(context.browser)
    # najdi kurz a klikni u nej na Upravit
    course_to_update = find_course(context.browser, context.name)
    assert course_to_update
    button_edit_course = course_to_update.find_element_by_css_selector('[data-qa=button_edit_course]')
    button_edit_course.click()
    # uloz puvodni pocet kurzu
    save_old_courses_cnt_to_context(context)
    # pockej az bude viditelny formular
    helpers.wait_form_settings_visible(context.browser)
    # klikni na smazat
    button_delete_course = context.browser.find_element_by_css_selector('[data-qa=settings_button_delete]')
    button_delete_course.click()
    # a potvrd smazani
    helpers.wait_for_alert_and_accept(context.browser)


@then('the course is not added')
def step_impl(context):
    # zjisti, zda se objevi alert (kurz se nepridal)
    try:
        helpers.wait_for_alert_and_accept(context.browser)
    except TimeoutException:
        # alert se neobjevil, zmizel formular?
        try:
            WebDriverWait(context.browser, helpers.WAIT_TIME_SHORT).until_not(
                EC.presence_of_element_located((By.CSS_SELECTOR, '[data-qa=form_settings]')))
        except TimeoutException:
            # formular nezmizel
            form_course_visible = True
        else:
            # formular zmizel
            form_course_visible = False
    else:
        # alert se objevil, takze formular je stale videt
        form_course_visible = True
    assert form_course_visible
    assert courses_cnt(context.browser) == context.old_courses_cnt


@when(
    'user updates the data of course "{cur_name}" to name "{new_name}" and visibility "{new_visible}"')
def step_impl(context, cur_name, new_name, new_visible):
    # nacti data kurzu do kontextu
    load_data_to_context(context, new_name, new_visible)
    # klikni v menu na nastaveni
    helpers.open_settings(context.browser)
    # pockej na nacteni
    helpers.wait_loading_ends(context.browser)
    # najdi kurz a klikni u nej na Upravit
    course_to_update = find_course(context.browser, cur_name)
    assert course_to_update
    button_edit_course = course_to_update.find_element_by_css_selector('[data-qa=button_edit_course]')
    button_edit_course.click()
    # uloz puvodni pocet kurzu
    save_old_courses_cnt_to_context(context)
    # vloz vsechny udaje do formulare
    last_field = insert_to_form(context)
    # odesli formular
    last_field.submit()


use_step_matcher("re")


@when('user adds new course "(?P<name>.*)" with visibility "(?P<visible>.*)"')
def step_impl(context, name, visible):
    # nacteni dat kurzu do kontextu
    load_data_to_context(context, name, visible)
    # klikni v menu na nastaveni
    helpers.open_settings(context.browser)
    # pockej na nacteni a pak klikni na Pridat kurz
    helpers.wait_loading_ends(context.browser)
    button_add_course = context.browser.find_element_by_css_selector('[data-qa=button_add_course]')
    button_add_course.click()
    # uloz puvodni pocet kurzu
    save_old_courses_cnt_to_context(context)
    # vloz vsechny udaje do formulare
    last_field = insert_to_form(context)
    # odesli formular
    last_field.submit()