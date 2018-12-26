from behave import *
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from tests import common_helpers
from selenium.common.exceptions import TimeoutException
from tests.ui_steps import helpers
from tests.common_steps import clients
from tests.ui_steps import login_logout


def get_clients(driver):
    return driver.find_elements_by_css_selector('[data-qa=client]')


def clients_cnt(driver):
    return len(get_clients(driver))


def open_clients(driver):
    driver.find_element_by_css_selector('[data-qa=menu_clients]').click()


def client_full_name(name, surname):
    return f"{surname} {name}"


def find_client(context):
    full_name = client_full_name(context.name, context.surname)
    all_clients = get_clients(context.browser)
    # najdi klienta s udaji v kontextu
    for client in all_clients:
        name = client.find_element_by_css_selector('[data-qa=client_name]').text
        phone = client.find_element_by_css_selector('[data-qa=client_phone]').text
        email = client.find_element_by_css_selector('[data-qa=client_email]').text
        note = client.find_element_by_css_selector('[data-qa=client_note]').text
        if (name == full_name and
                common_helpers.shrink_str(phone) == helpers.frontend_empty_str(common_helpers.shrink_str(context.phone)) and
                email == helpers.frontend_empty_str(context.email) and
                note == helpers.frontend_empty_str(context.note)):
            return True
    return False


def find_client_with_full_name(driver, full_name):
    all_clients = get_clients(driver)
    # najdi klienta s udaji v kontextu
    for client in all_clients:
        name = client.find_element_by_css_selector('[data-qa=client_name]').text
        if name == full_name:
            return client
    return False


def wait_form_visible(driver):
    WebDriverWait(driver, helpers.WAIT_TIME).until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-qa=form_client]')))


def insert_to_form(context):
    # pockej az bude viditelny formular
    wait_form_visible(context.browser)
    # vloz vsechny udaje do formulare
    name_field = context.browser.find_element_by_css_selector('[data-qa=client_field_name]')
    surname_field = context.browser.find_element_by_css_selector('[data-qa=client_field_surname]')
    phone_field = context.browser.find_element_by_css_selector('[data-qa=client_field_phone]')
    email_field = context.browser.find_element_by_css_selector('[data-qa=client_field_email]')
    note_field = context.browser.find_element_by_css_selector('[data-qa=client_field_note]')
    # smaz vsechny udaje
    name_field.clear()
    surname_field.clear()
    phone_field.clear()
    email_field.clear()
    note_field.clear()
    # vloz nove udaje
    name_field.send_keys(context.name)
    surname_field.send_keys(context.surname)
    phone_field.send_keys(context.phone)
    email_field.send_keys(context.email)
    note_field.send_keys(context.note)
    # vrat posledni element
    return note_field





@then("the client is added")
def step_impl(context):
    # pockej na pridani klienta
    WebDriverWait(context.browser, helpers.WAIT_TIME).until(
        lambda driver: clients_cnt(driver) > context.old_clients_cnt)
    # je klient opravdu pridany?
    client_found = find_client(context)
    assert client_found


@then("the client is updated")
def step_impl(context):
    # pockej na update klientu
    helpers.wait_loading_cycle(context.browser)
    # ma klient opravdu nove udaje?
    client_found = find_client(context)
    assert client_found
    assert clients_cnt(context.browser) == context.old_clients_cnt


@then("the client is deleted")
def step_impl(context):
    # pockej na pridani klienta
    WebDriverWait(context.browser, helpers.WAIT_TIME).until(
        lambda driver: clients_cnt(driver) < context.old_clients_cnt)
    # je klient opravdu pridany?
    client_found = find_client_with_full_name(context.browser, context.full_name)
    assert not client_found


@when('user deletes the client "{full_name}"')
def step_impl(context, full_name):
    # nacti jmeno klienta do kontextu
    context.full_name = full_name
    # klikni v menu na klienty
    open_clients(context.browser)
    # pockej na nacteni
    helpers.wait_loading_ends(context.browser)
    # najdi klienta a klikni u nej na Upravit
    client_to_update = find_client_with_full_name(context.browser, full_name)
    assert client_to_update
    button_edit_client = client_to_update.find_element_by_css_selector('[data-qa=button_edit_client]')
    button_edit_client.click()
    # uloz puvodni pocet klientu
    context.old_clients_cnt = clients_cnt(context.browser)
    # pockej az bude viditelny formular
    wait_form_visible(context.browser)
    # klikni na smazat
    button_delete_client = context.browser.find_element_by_css_selector('[data-qa=button_delete_client]')
    button_delete_client.click()
    # a potvrd smazani
    WebDriverWait(context.browser, helpers.WAIT_TIME).until(EC.alert_is_present())
    alert = context.browser.switch_to.alert
    alert.accept()


@then("the client is not added")
def step_impl(context):
    # zjisti, zda stale sviti formular a zadny klient nepribyl
    try:
        WebDriverWait(context.browser, helpers.WAIT_TIME_SHORT).until_not(
            EC.presence_of_element_located((By.CSS_SELECTOR, '[data-qa=form_client]')))
        form_client_visible = False
    except TimeoutException:
        form_client_visible = True
    assert form_client_visible
    assert clients_cnt(context.browser) == context.old_clients_cnt


use_step_matcher("re")


@when(
    'user adds new client "(?P<name>.*)" "(?P<surname>.*)" with phone "(?P<phone>.*)", email "(?P<email>.*)" and note "(?P<note>.*)"')
def step_impl(context, name, surname, phone, email, note):
    # nacti data klienta do kontextu
    context.name = name
    context.surname = surname
    context.phone = phone
    context.email = email
    context.note = note
    # klikni v menu na klienty
    open_clients(context.browser)
    # pockej na nacteni a pak klikni na Pridat klienta
    helpers.wait_loading_ends(context.browser)
    button_add_client = context.browser.find_element_by_css_selector('[data-qa=button_add_client]')
    button_add_client.click()
    # uloz puvodni pocet klientu
    context.old_clients_cnt = clients_cnt(context.browser)
    # vloz vsechny udaje do formulare
    last_field = insert_to_form(context)
    # odesli formular
    last_field.submit()


@when(
    'user updates the data of client "(?P<full_name>.*)" to name "(?P<new_name>.*)", surname "(?P<new_surname>.*)", phone "(?P<new_phone>.*)", email "(?P<new_email>.*)" and note "(?P<new_note>.*)"')
def step_impl(context, full_name, new_name, new_surname, new_phone, new_email, new_note):
    # nacti data klienta do kontextu
    context.name = new_name
    context.surname = new_surname
    context.phone = new_phone
    context.email = new_email
    context.note = new_note
    # klikni v menu na klienty
    open_clients(context.browser)
    # pockej na nacteni
    helpers.wait_loading_ends(context.browser)
    # najdi klienta a klikni u nej na Upravit
    client_to_update = find_client_with_full_name(context.browser, full_name)
    assert client_to_update
    button_edit_client = client_to_update.find_element_by_css_selector('[data-qa=button_edit_client]')
    button_edit_client.click()
    # uloz puvodni pocet klientu
    context.old_clients_cnt = clients_cnt(context.browser)
    # vloz vsechny udaje do formulare
    last_field = insert_to_form(context)
    # odesli formular
    last_field.submit()
