from behave import *
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.common.exceptions import TimeoutException
from tests.ui_steps import helpers
from selenium.webdriver.common.keys import Keys
from tests.common_steps import applications
from tests.ui_steps import login_logout


def get_applications(driver):
    return driver.find_elements_by_css_selector('[data-qa=application]')


def applications_cnt(driver):
    return len(get_applications(driver))


def open_applications(driver):
    driver.find_element_by_css_selector('[data-qa=menu_applications]').click()


def showed_applications_cnts_for_courses_matches(driver):
    # zkontroluj, zda sedi zobrazene cislo s poctem zajemcu o kurzy se skutecnym poctem zajemcu o dany kurz
    all_found_courses_with_applications = driver.find_elements_by_css_selector('[data-qa=applications_for_course]')
    success = True
    for course_with_applications in all_found_courses_with_applications:
        computed_cnt = len(course_with_applications.find_elements_by_css_selector('[data-qa=application]'))
        showed_cnt = int(course_with_applications.find_element_by_css_selector('[data-qa=applications_for_course_cnt]').text)
        if showed_cnt != computed_cnt:
            success = False
            break
    return success


def find_application(driver, client, course, **data):
    all_found_courses_with_applications = driver.find_elements_by_css_selector('[data-qa=applications_for_course]')
    for course_with_applications in all_found_courses_with_applications:
        found_course = course_with_applications.find_element_by_css_selector('[data-qa=application_course]').text
        applications_for_course = course_with_applications.find_elements_by_css_selector('[data-qa=application]')
        # najdi zadost s udaji v parametrech
        for application in applications_for_course:
            found_client = application.find_element_by_css_selector('[data-qa=client_name]').text
            # srovnej identifikatory
            if found_client == client and found_course == course:
                # identifikatory sedi, otestuj pripadna dalsi zaslana data nebo rovnou vrat nalezeny prvek
                if data:
                    found_note = application.find_element_by_css_selector('[data-qa=application_note]').text
                    if found_note == data['note']:
                        return application
                else:
                    return application
    return False


def find_application_with_context(context):
    return find_application(context.browser, context.client, context.course, note=context.note)


def wait_form_visible(driver):
    WebDriverWait(driver, helpers.WAIT_TIME).until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-qa=form_application]')))


def insert_to_form(context):
    # pockej az bude viditelny formular
    wait_form_visible(context.browser)
    # vloz vsechny udaje do formulare
    client_field = context.browser.find_element_by_id('client')
    course_field = context.browser.find_element_by_id('course')
    note_field = context.browser.find_element_by_css_selector('[data-qa=application_field_note]')
    # smaz vsechny udaje
    client_field.send_keys(Keys.BACK_SPACE)
    course_field.send_keys(Keys.BACK_SPACE)
    note_field.clear()
    # vloz nove udaje
    helpers.react_select_insert(context.browser, client_field, context.client)
    helpers.react_select_insert(context.browser, course_field, context.course)
    note_field.send_keys(context.note)
    # vrat posledni element
    return note_field


def load_data_to_context(context, full_name, course, note):
    load_id_data_to_context(context, full_name, course)
    context.note = note


def load_id_data_to_context(context, full_name, course):
    context.client = full_name
    context.course = course


def save_old_applications_cnt_to_context(context):
    context.old_applications_cnt = applications_cnt(context.browser)


@then('the application is added')
def step_impl(context):
    # pockej na pridani zadosti
    WebDriverWait(context.browser, helpers.WAIT_TIME).until(
        lambda driver: applications_cnt(driver) > context.old_applications_cnt)
    # je zadost opravdu pridana?
    assert find_application_with_context(context)
    assert showed_applications_cnts_for_courses_matches(context.browser)


@then('the application is updated')
def step_impl(context):
    # pockej na update zadosti
    helpers.wait_loading_cycle(context.browser)
    # ma zadost opravdu nove udaje?
    assert find_application_with_context(context)
    assert applications_cnt(context.browser) == context.old_applications_cnt
    assert showed_applications_cnts_for_courses_matches(context.browser)


@then('the application is deleted')
def step_impl(context):
    # pockej na smazani zadosti
    WebDriverWait(context.browser, helpers.WAIT_TIME).until(
        lambda driver: applications_cnt(driver) < context.old_applications_cnt)
    # je zadost opravdu smazana?
    assert not find_application(context.browser, context.client, context.course)
    assert showed_applications_cnts_for_courses_matches(context.browser)


@when('user deletes the application from client "{full_name}" for course "{course}"')
def step_impl(context, full_name, course):
    assert showed_applications_cnts_for_courses_matches(context.browser)
    # nacti jmeno zadosti do kontextu
    load_id_data_to_context(context, full_name, course)
    # klikni v menu na zadosti
    open_applications(context.browser)
    # pockej na nacteni
    helpers.wait_loading_ends(context.browser)
    # najdi zadost
    application_to_update = find_application(context.browser, context.client, context.course)
    assert application_to_update
    # uloz puvodni pocet zadosti
    save_old_applications_cnt_to_context(context)
    # klikni na smazat
    button_delete_application = context.browser.find_element_by_css_selector('[data-qa=button_delete_application]')
    button_delete_application.click()
    # a potvrd smazani
    helpers.wait_for_alert_and_accept(context.browser)


@then('the application is not added')
def step_impl(context):
    # zjisti, zda se objevi alert (zadost se nepridala)
    try:
        helpers.wait_for_alert_and_accept(context.browser)
    except TimeoutException:
        # alert se neobjevil, zmizel formular?
        try:
            WebDriverWait(context.browser, helpers.WAIT_TIME_SHORT).until_not(
                EC.presence_of_element_located((By.CSS_SELECTOR, '[data-qa=form_application]')))
        except TimeoutException:
            # formular nezmizel
            form_application_visible = True
        else:
            # formular zmizel
            form_application_visible = False
    else:
        # alert se objevil, takze formular je stale videt
        form_application_visible = True
    assert form_application_visible
    assert applications_cnt(context.browser) == context.old_applications_cnt
    assert showed_applications_cnts_for_courses_matches(context.browser)


@when(
    'user updates the data of the application from client "{cur_full_name}" for course "{cur_course}" to client "{new_full_name}", course "{new_course}" and note "{new_note}"')
def step_impl(context, cur_full_name, cur_course, new_full_name, new_course, new_note):
    assert showed_applications_cnts_for_courses_matches(context.browser)
    # nacti data zadosti do kontextu
    load_data_to_context(context, new_full_name, new_course, new_note)
    # klikni v menu na zadosti
    open_applications(context.browser)
    # pockej na nacteni
    helpers.wait_loading_ends(context.browser)
    # najdi zadost a klikni u ni na Upravit
    application_to_update = find_application(context.browser, cur_full_name, cur_course)
    assert application_to_update
    button_edit_application = application_to_update.find_element_by_css_selector('[data-qa=button_edit_application]')
    button_edit_application.click()
    # uloz puvodni pocet zadosti
    save_old_applications_cnt_to_context(context)
    # vloz vsechny udaje do formulare
    last_field = insert_to_form(context)
    # odesli formular
    last_field.submit()


use_step_matcher("re")


@when(
    'user adds new application from client "(?P<full_name>.*)" for course "(?P<course>.*)" with note "(?P<note>.*)"')
def step_impl(context, full_name, course, note):
    assert showed_applications_cnts_for_courses_matches(context.browser)
    # nacti data zadosti do kontextu
    load_data_to_context(context, full_name, course, note)
    # klikni v menu na zadosti
    open_applications(context.browser)
    # pockej na nacteni a pak klikni na Pridat zajemce
    helpers.wait_loading_ends(context.browser)
    button_add_application = context.browser.find_element_by_css_selector('[data-qa=button_add_application]')
    button_add_application.click()
    # uloz puvodni pocet zadosti
    save_old_applications_cnt_to_context(context)
    # vloz vsechny udaje do formulare
    last_field = insert_to_form(context)
    # odesli formular
    last_field.submit()