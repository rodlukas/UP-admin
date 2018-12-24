from behave import *
from tests import helpers
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By


@given("the user is logged")
def step_impl(context):
    # prejdi na hlavni stranku
    context.browser.get(context.base_url)
    # vloz prihlasovaci udaje do formulare
    username_field = context.browser.find_element_by_css_selector('[data-qa=login_field_username]')
    password_field = context.browser.find_element_by_css_selector('[data-qa=login_field_password]')
    username_field.send_keys(context.user['username'])
    password_field.send_keys(context.user['password'])
    # prihlas se
    password_field.submit()
    # pokud je viditelne tlacitko pro odhlaseni, doslo k uspesnemu prihlaseni
    logout_button_visible = WebDriverWait(context.browser, helpers.WAIT_TIME).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, '[data-qa=button_logout]')))
    assert logout_button_visible
