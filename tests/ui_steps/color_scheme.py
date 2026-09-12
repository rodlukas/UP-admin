from behave import when, then, use_step_matcher
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

# noinspection PyUnresolvedReferences
from tests.ui_steps import helpers, login_logout

# use_step_matcher je globalni stav a jine moduly kroku ho prepinaji na "re";
# explicitni volba "parse" zajistuje, ze registrace kroku nezavisi na poradi
# ani zpusobu nacteni modulu (behave exec vs. python import)
use_step_matcher("parse")

# localStorage klic, do ktereho Mantine persistuje zvolene barevne schema
# (stejny klic cte i admin/static/admin/color-scheme-init.js pred startem aplikace)
LOCAL_STORAGE_COLOR_SCHEME_KEY = "mantine-color-scheme"


def get_color_scheme_from_local_storage(driver):
    return driver.execute_script(
        "return window.localStorage.getItem(arguments[0]);", LOCAL_STORAGE_COLOR_SCHEME_KEY
    )


def get_applied_color_scheme(driver):
    # aplikovane schema nese atribut data-mantine-color-scheme na <html>
    # (nastavuje ho Mantine, po nacteni stranky jeste pred startem Reactu init skript)
    return driver.find_element(By.TAG_NAME, "html").get_attribute("data-mantine-color-scheme")


@when('user switches the color scheme to "{scheme}"')
def step_impl(context, scheme):
    # pockej na nacteni hlavni stranky
    helpers.wait_loading_ends(context.browser)
    # otevri dropdown prepinace barevneho schematu v navbaru
    toggle = WebDriverWait(context.browser, helpers.WAIT_TIME).until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, "[data-qa=color_scheme_toggle]"))
    )
    toggle.click()
    # pockej na zobrazeni polozky menu (dropdown je portalovany) a vyber dane schema
    scheme_item = WebDriverWait(context.browser, helpers.WAIT_TIME).until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, f"[data-qa=color_scheme_{scheme}]"))
    )
    scheme_item.click()


@when("user reloads the page")
def step_impl(context):
    context.browser.refresh()
    # pockej na nacteni aplikace po reloadu
    helpers.wait_loading_ends(context.browser)


@then('the "{scheme}" color scheme is active')
def step_impl(context, scheme):
    # pockej, az bude na <html> nastavene pozadovane schema
    WebDriverWait(context.browser, helpers.WAIT_TIME).until(
        lambda driver: get_applied_color_scheme(driver) == scheme
    )
    # volba musi byt persistovana v localStorage (kontrakt mezi Mantine a init skriptem,
    # diky nemu schema prezije reload stranky)
    assert get_color_scheme_from_local_storage(context.browser) == scheme
