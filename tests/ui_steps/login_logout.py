from behave import when, then
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC

# noinspection PyUnresolvedReferences
from tests.common_steps import login_logout
from tests.ui_steps import helpers

LOCAL_STORAGE_JWT_KEY = "jwt"


def get_jwt_from_local_storage(driver):
    return driver.execute_script(
        "return window.localStorage.getItem(arguments[0]);", LOCAL_STORAGE_JWT_KEY
    )


def _login_request_running(driver):
    """Bezi prave ted prihlasovaci pozadavek?

    SubmitButton ho hlasi pres `aria-busy` (Login.tsx mu predava `isLoading`
    z AuthContextu). Ptame se jednim dotazem uvnitr prohlizece, ne pres nalezeny
    element: prave v okamziku, na ktery se tady ceka, React prihlasovaci formular
    odmountuje, takze mezi `find_elements` a ctenim atributu by reference na tlacitko
    stihla zeschnout a cekani by spadlo na StaleElementReferenceException. Kdyz
    tlacitko v DOM neni, zadny pozadavek nebezi.
    """
    return driver.execute_script("""
        const button = document.querySelector("[data-qa=button_submit_login]");
        return button !== null && button.getAttribute("aria-busy") === "true";
        """)


def wait_login_settled(driver):
    """Pocka, az pokus o prihlaseni dobehne - at uz uspechem, nebo neuspechem.

    Ceka se na dobehnuti pozadavku, ne na objeveni prihlaseneho rozhrani: u scenare
    se spatnymi udaji zadne prihlasene rozhrani nikdy neprijde a cekani na nej by
    vzdycky vycerpalo cely timeout. Poradi obou fazi je podstatne - bez cekani na
    rozjety pozadavek by se stav cetl jeste pred jeho odeslanim.
    """
    try:
        helpers.wait(driver, helpers.WAIT_TIME_SHORT).until(_login_request_running)
    except TimeoutException:
        # pozadavek uz dobehl driv, nez jsme se na nej stihli podivat (nebo se vubec
        # nerozjel) - vysledek stejne rozhoduje token, viz check_login
        return
    helpers.wait(driver).until_not(_login_request_running)


def check_login(context):
    # pockej, az pokus o prihlaseni dobehne, a teprve pak cti vysledek
    wait_login_settled(context.browser)
    # O uspechu rozhoduje token: uklada se hned, jak dorazi odpoved, zatimco prihlasene
    # rozhrani se vykresli az o nekolik renderu pozdeji. Tlacitko odhlaseni se proto
    # necha dojet jen tam, kde ho token slibuje - bez toho by bud hrozilo cteni DOM
    # driv, nez ho React staci prekreslit, nebo by negativni scenar cekal nadarmo.
    jwt = get_jwt_from_local_storage(context.browser)
    if jwt is None:
        return False, None
    context.button_logout = helpers.wait(context.browser).until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, "[data-qa=button_logout]"))
    )
    return True, jwt


def wait_form_login_visible(driver):
    helpers.wait(driver, helpers.WAIT_TIME).until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, "[data-qa=login_field_username]"))
    )


def login(context, username, password):
    # prejdi na hlavni stranku
    context.browser.get(context.base_url)
    # pockej az bude dostupny prihlasovaci formular
    wait_form_login_visible(context.browser)
    # vloz prihlasovaci udaje do formulare
    username_field = context.browser.find_element(By.CSS_SELECTOR, "[data-qa=login_field_username]")
    password_field = context.browser.find_element(By.CSS_SELECTOR, "[data-qa=login_field_password]")
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
        helpers.wait(context.browser, helpers.WAIT_TIME_SHORT).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "[data-qa=form_login]"))
        )
        form_login_visible = True
    except TimeoutException:
        form_login_visible = False
    assert form_login_visible
    # v localstorage nesmi byt token
    jwt = get_jwt_from_local_storage(context.browser)
    assert jwt is None
