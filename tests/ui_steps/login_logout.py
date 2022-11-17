from behave import when, then
from selenium.common.exceptions import NoSuchElementException, TimeoutException
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from imgrender import render

# noinspection PyUnresolvedReferences
from tests.common_steps import login_logout  # lgtm [py/unused-import]
from tests.ui_steps import helpers

LOCAL_STORAGE_JWT_KEY = "jwt"


def get_jwt_from_local_storage(driver):
    return driver.execute_script(
        "return window.localStorage.getItem(arguments[0]);", LOCAL_STORAGE_JWT_KEY
    )


def check_login(context):
    # pockej na nacteni hlavni stranky (aby nedoslo ke zbytecnemu preruseni pozadavku)
    helpers.wait_loading_ends(context.browser)
    # pokud je viditelne tlacitko pro odhlaseni, doslo k uspesnemu prihlaseni
    try:
        context.button_logout = context.browser.find_element_by_css_selector(
            "[data-qa=button_logout]"
        )
        button_logout_visible = True
    except NoSuchElementException:
        button_logout_visible = False
    # v localstorage musi byt token
    jwt = get_jwt_from_local_storage(context.browser)
    return button_logout_visible, jwt


def wait_form_login_visible(driver):
    WebDriverWait(driver, helpers.WAIT_TIME).until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, "[data-qa=login_field_username]"))
    )


def login(context, username, password):
    # prejdi na hlavni stranku
    context.browser.get(context.base_url)
    context.browser.implicitly_wait(10)
    print(context.browser.page_source)
    context.browser.find_element_by_tag_name('body')
    context.browser.save_screenshot('screenshot.png')
    # pockej az bude dostupny prihlasovaci formular
    wait_form_login_visible(context.browser)
    # vloz prihlasovaci udaje do formulare
    username_field = context.browser.find_element_by_css_selector("[data-qa=login_field_username]")
    password_field = context.browser.find_element_by_css_selector("[data-qa=login_field_password]")
    username_field.send_keys(username)
    password_field.send_keys(password)
    # prihlas se
    helpers.submit_form(context, "button_submit_login")


@when("user logs into app with correct credentials")
def step_impl(context):
    login(context, context.user["username"], context.user["password"])


@when("user logs into app with wrong credentials")
def step_impl(context):
    login(context, context.user["username"], "wrongPassword")


@then("user is logged into app")
def step_impl(context):
    button_logout_visible, jwt = check_login(context)
    assert button_logout_visible
    assert jwt is not None


@then("user is not logged into app")
def step_impl(context):
    button_logout_visible, jwt = check_login(context)
    assert not button_logout_visible
    assert jwt is None


@when("user logs out of app")
def step_impl(context):
    # pockej na nacteni hlavni stranky
    helpers.wait_loading_ends(context.browser)
    # odhlas se
    context.button_logout.click()


@then("user is logged out of app")
def step_impl(context):
    # pokud neni viditelne tlacitko pro odhlaseni, doslo k uspesnemu odhlaseni
    try:
        WebDriverWait(context.browser, helpers.WAIT_TIME_SHORT).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "[data-qa=form_login]"))
        )
        form_login_visible = True
    except TimeoutException:
        form_login_visible = False
    assert form_login_visible
    # v localstorage nesmi byt token
    jwt = get_jwt_from_local_storage(context.browser)
    assert jwt is None
