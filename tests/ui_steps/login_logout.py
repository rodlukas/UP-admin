from behave import *
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.common.exceptions import NoSuchElementException, TimeoutException
from tests.ui_steps import helpers
from tests.common_steps import login_logout

LOCAL_STORAGE_JWT_KEY = 'jwt'


def get_jwt_from_local_storage(driver):
    return driver.execute_script("return window.localStorage.getItem(arguments[0]);", LOCAL_STORAGE_JWT_KEY)


@When('user logs into app')
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


@Then('user is logged into app')
def step_impl(context):
    # pockej na nacteni hlavni stranky (aby nedoslo ke zbytecnemu preruseni pozadavku)
    helpers.wait_loading_ends(context.browser)
    # pokud je viditelne tlacitko pro odhlaseni, doslo k uspesnemu prihlaseni
    try:
        context.button_logout = context.browser.find_element_by_css_selector('[data-qa=button_logout]')
        button_logout_visible = True
    except NoSuchElementException:
        button_logout_visible = False
    assert button_logout_visible
    # v localstorage musi byt token
    jwt = get_jwt_from_local_storage(context.browser)
    assert jwt is not None


@When('user logs out of app')
def step_impl(context):
    # pockej na nacteni hlavni stranky
    helpers.wait_loading_ends(context.browser)
    # odhlas se
    context.button_logout.click()


@Then('user is logged out of app')
def step_impl(context):
    # pokud neni viditelne tlacitko pro odhlaseni, doslo k uspesnemu odhlaseni
    try:
        WebDriverWait(context.browser, helpers.WAIT_TIME_SHORT).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, '[data-qa=form_login]')))
        form_login_visible = True
    except TimeoutException:
        form_login_visible = False
    assert form_login_visible
    # v localstorage nesmi byt token
    jwt = get_jwt_from_local_storage(context.browser)
    assert jwt is None
