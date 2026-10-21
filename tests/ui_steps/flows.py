"""Sdilene pruchody pro pruvodce lekci, karty a vyhledavani.

Soubor sam neregistruje kroky behave, ale import nize ano - kazdy modul s kroky
(applications.py, clients.py, groups.py, lectures.py) si pri prvnim naimportovani
zaregistruje vsechny sve kroky, at uz ho nacita primo behave pri prochazeni adresare,
nebo tenhle import.
Bez explicitniho use_step_matcher("parse") mezi importy by dalsi modul zdedil "re",
na ktere predchozi prepina matcher na konci sveho souboru - behave by pak jeho kroky
zaregistroval jednou jako regularni vyraz (pres tento import) a podruhe jako parse
retezec (az behave dojde k danemu souboru v adresari primo), coz konci jako
AmbiguousStep.

Proto vsechny ostatni moduly s kroky, ktere potrebuji znovupouzit pruchody klientu/
skupin/lekci (card.py, dashboard.py, diary.py, nested.py, search.py, ...), importuji
misto primeho "from tests.ui_steps import clients" radeji tenhle soubor a pristupuji
k `client_ui`/`group_ui`/`lecture_ui` jako k jeho atributum - rika se tim bezpecne
importum nad rizene jen na jednom miste.
"""

from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from behave import use_step_matcher

from tests.ui_steps import applications as application_ui

use_step_matcher("parse")

from tests.ui_steps import clients as client_ui

use_step_matcher("parse")

from tests.ui_steps import groups as group_ui

use_step_matcher("parse")

from tests.ui_steps import helpers
from tests.ui_steps import lectures as lecture_ui

# lectures.py na konci sveho souboru prepina matcher na "re" (viz docstring vyse) -
# bez tohoto resetu by to zdedil kazdy modul, ktery si z tohoto souboru neco importuje
use_step_matcher("parse")


def click(driver, selector):
    element = helpers.wait(driver).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, selector))
    )
    driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", element)
    helpers.wait(driver).until(EC.element_to_be_clickable((By.CSS_SELECTOR, selector)))
    element.click()
    return element


def open_wizard(driver, date):
    # prazdne date je pruvodce v zahlavi (datum doplni uzivatel ve formulari)
    click(driver, f"[data-qa=button_add_lecture_wizard][data-date='{date}']")


def choose_wizard_target(driver, kind):
    click(driver, f"[data-qa=wizard_lecture_{kind}]")
    return "client" if kind == "client" else "group"


def pick_wizard_target(driver, field_id, value):
    """Vybere klienta/skupinu ve vyberovem modalu pruvodce pridani lekce (By.ID field_id).

    Nelze pouzit helpers.combobox_insert: ten po kliknuti na volbu overuje spravnou
    hodnotu na PUVODNIM poli - ale uspesny vyber tady rovnou zavira cely vyberovy modal
    a nahrazuje ho druhym se samotnym formularem lekce (ModalLecturesWizard.onSelectChange),
    takze puvodni pole uz v tu chvili neexistuje a combobox_insert by hlasil falesny
    neuspech. Spravnost vyberu misto toho overi az prechod na form_lecture
    (wait_form_ready uvnitr nasledujiciho submit_lecture/insert_to_form).
    """
    field = helpers.wait(driver).until(EC.visibility_of_element_located((By.ID, field_id)))
    helpers.clear_input(field)
    field.send_keys(value)
    options = helpers.wait_combobox_options(driver)
    matched = next((option for option in options if option.text == value), None)
    assert matched is not None, f"Volba '{value}' nebyla v pruvodci nalezena"
    matched.click()


def submit_lecture(context):
    lecture_ui.insert_to_form(context)
    helpers.submit_form(context, "button_submit_lecture")
    helpers.wait_modal_closed(context.browser)


def add_lecture_for_existing(
    context, kind, target, obj, date, time, duration, attendances, wizard_date=None
):
    # wizard_date se hodi tam, kde se otevira pruvodce v zahlavi (prazdne data-date,
    # datum uzivatel doplni az ve formulari) - diar oproti tomu ma pruvodce u kazdeho
    # dne zvlast (data-date odpovida dni), tam se wizard_date rovna datu lekce
    open_wizard(context.browser, date if wizard_date is None else wizard_date)
    field_id = choose_wizard_target(context.browser, kind)
    pick_wizard_target(context.browser, field_id, target)
    lecture_ui.load_data_to_context(
        context, obj, date, time, duration, "False", attendances, is_group=kind == "group"
    )
    submit_lecture(context)


def add_client_in_open_form(context, firstname, surname, phone, email, note):
    click(context.browser, "[data-qa=button_add_client]")
    client_ui.load_data_to_context(context, firstname, surname, phone, email, note, "True")
    client_ui.insert_to_form(context)
    helpers.submit_form(context, "button_submit_client")


def add_lecture_for_new_client(
    context, firstname, surname, phone, email, note, course, date, time, duration
):
    open_wizard(context.browser, date)
    choose_wizard_target(context.browser, "client")
    add_client_in_open_form(context, firstname, surname, phone, email, note)
    helpers.wait_form_ready(context.browser, "form_lecture")
    full_name = f"{surname} {firstname}"
    attendances = [lecture_ui.attendance_dict(full_name, "OK", "True", "")]
    lecture_ui.load_data_to_context(context, course, date, time, duration, "False", attendances)
    submit_lecture(context)
    return full_name


def fill_group_form_with_new_client(context, name, course_name, firstname, surname):
    """Vyplni uz otevreny formular skupiny nazvem, kurzem a novym klientem jako clenem.

    Sdileno mezi primym pridanim skupiny (nested.py) a pridanim skupiny z pruvodce lekci
    (add_lecture_for_new_group_with_new_client nize) - oba oteviraji stejny FormGroups,
    jen jinym tlacitkem.
    """
    group_ui.wait_form_visible(context.browser)
    name_field = context.browser.find_element(By.CSS_SELECTOR, "[data-qa=group_field_name]")
    name_field.send_keys(name)
    course_field = context.browser.find_element(By.ID, "course")
    assert helpers.combobox_insert(context.browser, course_field, course_name)
    add_client_in_open_form(context, firstname, surname, "", "", "")


def add_lecture_for_new_group_with_new_client(
    context, group_name, course_name, firstname, surname, date, time, duration, wizard_date=None
):
    # wizard v pruvodci lekce nabizi "nebo pridejte novou skupinu" (button_add_group) misto
    # vyberu existujici - otevre stejny FormGroups jako na strance Skupiny, jen vnoreny
    # uvnitr pruvodce. Po jeho uspesnem odeslani ModalGroups svuj modal zavre, ale
    # ModalLecturesWizard.processAdditionOfGroupOrClient rovnou spusti fetch vychozich
    # hodnot lekce a vyberovy modal pritom zustava otevreny (jen s kostrou) - pocet modalu
    # tedy NIKDY neklesne na nulu (na rozdil od primeho pridani skupiny v nested.py), proto
    # nelze cekat na wait_modal_closed, ale rovnou na pripraveny formular lekce
    open_wizard(context.browser, date if wizard_date is None else wizard_date)
    choose_wizard_target(context.browser, "group")
    click(context.browser, "[data-qa=button_add_group]")
    fill_group_form_with_new_client(context, group_name, course_name, firstname, surname)
    helpers.submit_form(context, "button_submit_group")
    helpers.wait_form_ready(context.browser, "form_lecture")
    full_name = f"{surname} {firstname}"
    attendances = [lecture_ui.attendance_dict(full_name, "OK", "True", "")]
    lecture_ui.load_data_to_context(
        context, group_name, date, time, duration, "False", attendances, is_group=True
    )
    submit_lecture(context)
    return full_name


def lecture_visible_on_card(context, opener, who):
    assert opener(context, who)
    helpers.wait(context.browser).until(
        lambda driver: lecture_ui.find_lecture_with_context(context)
    )


def open_spotlight(driver):
    click(driver, "[data-qa=button_search]")
    field = helpers.wait(driver).until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, "[data-qa=spotlight_search]"))
    )
    if field.tag_name != "input":
        field = field.find_element(By.CSS_SELECTOR, "input")
    return field


def spotlight_pick(driver, query, result_label=None):
    # result_label se hodi, kdyz dotaz nesedi doslovne s textem vysledku (napr. hledani
    # bez diakritiky - Fuse ignoreDiacritics najde "Rodová Petra" i pro dotaz "rodova",
    # ale text tlacitka ve vysledcich zustava s diakritikou)
    field = open_spotlight(driver)
    field.send_keys(query)
    option = helpers.wait(driver).until(
        EC.element_to_be_clickable(
            (
                By.XPATH,
                "//*[@data-qa='spotlight_result']"
                f"[contains(normalize-space(.), '{result_label or query}')]",
            )
        )
    )
    option.click()


def heading_text(driver, qa):
    return driver.find_element(By.CSS_SELECTOR, f"h1 [data-qa={qa}]").text


def wait_text(driver, text):
    helpers.wait(driver).until(EC.text_to_be_present_in_element((By.TAG_NAME, "body"), text))


def wait_notification(driver, text):
    """Pocka na notifikaci s textem - mutace je tim dokoncena (hodi se pred reloadem)."""
    helpers.wait(driver).until(
        lambda d: any(
            text in notification.text
            for notification in d.find_elements(By.CSS_SELECTOR, "[data-qa=notification]")
        )
    )
