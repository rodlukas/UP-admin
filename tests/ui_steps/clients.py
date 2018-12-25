from behave import *
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from tests import helpers
from selenium.common.exceptions import TimeoutException
from tests.common_steps import clients
from tests.ui_steps import common


def get_clients(driver):
    return driver.find_elements_by_css_selector('[data-qa=client]')


def clients_cnt(driver):
    return len(get_clients(driver))


@then("the client is added")
def step_impl(context):
    full_name = context.surname + " " + context.name
    # pockej na pridani klienta
    WebDriverWait(context.browser, helpers.WAIT_TIME).until(
        lambda driver: clients_cnt(driver) > context.old_clients_cnt)
    all_clients = get_clients(context.browser)
    # zkontroluj udaje pridaneho klienta
    new_client_found = False
    for client in all_clients:
        name = client.find_element_by_css_selector('[data-qa=client_name]').text
        phone = client.find_element_by_css_selector('[data-qa=client_phone]').text
        email = client.find_element_by_css_selector('[data-qa=client_email]').text
        note = client.find_element_by_css_selector('[data-qa=client_note]').text
        if (name == full_name and
                helpers.shrink_str(phone) == helpers.frontend_empty_str(helpers.shrink_str(context.phone)) and
                email == helpers.frontend_empty_str(context.email) and
                note == helpers.frontend_empty_str(context.note)):
            new_client_found = True
            break
    assert new_client_found


@then("the client is updated")
def step_impl(context):
    #TODO
    ...


@then("the client is deleted")
def step_impl(context):
    # TODO
    ...


use_step_matcher("re")


@when(
    'user adds new client "(?P<name>.*)" "(?P<surname>.*)" with phone "(?P<phone>.*)", email "(?P<email>.*)" and note "(?P<note>.*)"')
def step_impl(context, name, surname, phone, email, note):
    # nacteni dat klienta do kontextu
    context.name = name
    context.surname = surname
    context.phone = phone
    context.email = email
    context.note = note
    # klikni v menu na klienty
    context.browser.find_element_by_css_selector('[data-qa=menu_clients]').click()
    # pockej na nacteni a klikni na Pridat klienta
    WebDriverWait(context.browser, helpers.WAIT_TIME).until(
        EC.invisibility_of_element((By.CSS_SELECTOR, '[data-qa=loading]')))
    button_add_client = context.browser.find_element_by_css_selector('[data-qa=button_add_client]')
    button_add_client.click()
    # vloz vsechny udaje do formulare
    name_field = context.browser.find_element_by_css_selector('[data-qa=client_field_name]')
    surname_field = context.browser.find_element_by_css_selector('[data-qa=client_field_surname]')
    phone_field = context.browser.find_element_by_css_selector('[data-qa=client_field_phone]')
    email_field = context.browser.find_element_by_css_selector('[data-qa=client_field_email]')
    note_field = context.browser.find_element_by_css_selector('[data-qa=client_field_note]')
    name_field.send_keys(context.name)
    surname_field.send_keys(context.surname)
    phone_field.send_keys(context.phone)
    email_field.send_keys(context.email)
    note_field.send_keys(context.note)
    # uloz puvodni pocet klientu
    context.old_clients_cnt = clients_cnt(context.browser)
    # odesli formular
    note_field.submit()


@when(
    'user updates the data of client "(?P<full_name>.*)" to name "(?P<new_name>.*)", surname "(?P<new_surname>.*)", phone "(?P<new_phone>.*)", email "(?P<new_email>.*)" and note "(?P<new_note>.*)"')
def step_impl(context, full_name, new_name, new_surname, new_phone, new_email, new_note):
    #TODO
    ...


@when(
    'user deletes the client "(?P<full_name>.*)"')
def step_impl(context, full_name):
    # TODO
    ...


@then("the client is not added")
def step_impl(context):
    # zjisti, zda stale sviti formular a zadny klient nepribyl
    try:
        WebDriverWait(context.browser, helpers.WAIT_TIME_SHORT).until(EC.staleness_of(
            context.browser.find_element_by_css_selector('[data-qa=form_client]')))
        form_client_visible = False
    except TimeoutException:
        form_client_visible = True
    assert form_client_visible
    assert clients_cnt(context.browser) == context.old_clients_cnt
