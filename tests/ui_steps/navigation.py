import re

from behave import when, then
from selenium.common.exceptions import (
    NoSuchElementException,
    StaleElementReferenceException,
    TimeoutException,
)
from selenium.webdriver.common.by import By

from tests.ui_steps import helpers

# noinspection PyUnresolvedReferences
from tests.ui_steps import login_logout

# ocekavany text h1, ktery kazda sekce po otevreni ukaze - dashboard a diar nemaji v h1
# nazev sekce z menu, ale neco vlastniho (nadpis dnesniho dne, resp. tyden); u ostatnich
# sekci sedi s popiskem v menu (Menu.tsx NAV_ITEMS). Hleda se jen v h1, protoze popisky
# menu jsou na strance vzdy, takze hledani v celem body by proslo i bez otevreni sekce
# Prehled je posledni: po prihlaseni na nem uzivatel uz je, prvni kontrola by nic neoverila
SECTION_TEXTS = {
    "menu_diary": "Týden",
    "menu_clients": "Klienti",
    "menu_groups": "Skupiny",
    "menu_applications": "Zájemci",
    "menu_statistics": "Statistiky",
    "menu_settings": "Nastavení",
    "menu_dashboard": "Dnešní lekce",
}


@when("user opens every section from the menu")
def step_impl(context):
    context.section_results = {}
    for qa, expected_text in SECTION_TEXTS.items():
        context.browser.find_element(By.CSS_SELECTOR, f"[data-qa={qa}]").click()
        helpers.wait_loading_ends(context.browser)
        try:
            helpers.wait_page_title(context.browser, lambda title: expected_text in title)
            context.section_results[qa] = None
        except TimeoutException:
            # sekce se nepovedlo otevrit - ostatni se i tak projdou, selhani hlasi az dalsi krok
            try:
                context.section_results[qa] = helpers.page_title(context.browser)
            except NoSuchElementException:
                context.section_results[qa] = "(bez h1)"


@then("each section shows its title")
def step_impl(context):
    failed = {
        qa: f'h1 "{title}", ocekavano "{SECTION_TEXTS[qa]}"'
        for qa, title in context.section_results.items()
        if title is not None
    }
    assert not failed, f"sekce bez ocekavaneho nadpisu: {failed}"


@when("user opens an address that does not exist")
def step_impl(context):
    context.browser.get(f"{context.base_url}/this-address-does-not-exist")
    helpers.wait_loading_ends(context.browser)


@then("the not found page is shown")
def step_impl(context):
    # po plnem nacteni stranky se aplikace teprve namountuje - wait_loading_ends v predchozim
    # kroku muze skoncit driv, nez se vubec objevi nacitani
    helpers.wait(context.browser, helpers.WAIT_TIME).until(
        lambda driver: driver.find_elements(By.CSS_SELECTOR, "[data-qa=page_not_found]")
    )


@when('user filters the client list by "{query}"')
def step_impl(context, query):
    context.browser.find_element(By.CSS_SELECTOR, "[data-qa=menu_clients]").click()
    helpers.wait_loading_ends(context.browser)
    search_field = context.browser.find_element(By.CSS_SELECTOR, "[data-qa=table_search]")
    search_field.send_keys(query)


@when("user switches the client list to inactive")
def step_impl(context):
    helpers.toggle_switcher_active(context.browser, False)


@then("the client list shows only {names}")
def step_impl(context, names):
    expected = set(re.findall(r'"([^"]+)"', names))

    def found(driver):
        return {
            element.text
            for element in driver.find_elements(By.CSS_SELECTOR, "[data-qa=client_name]")
        }

    # filtr i prepinac bezi na klientovi bez fetche - seznam se prekresli az chvili po akci
    helpers.wait(
        context.browser, helpers.WAIT_TIME, ignored_exceptions=(StaleElementReferenceException,)
    ).until(lambda driver: found(driver) == expected)
