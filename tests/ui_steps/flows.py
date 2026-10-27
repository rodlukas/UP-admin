"""Sdilene pruchody pro pruvodce lekci, upravu lekce v dennim prehledu a vyhledavani.

Moduly s kroky, ktere potrebuji pruchody klientu, skupin a lekci, importuji tenhle soubor
a pouzivaji `client_ui`/`group_ui`/`lecture_ui`, ne primo `from tests.ui_steps import clients`.
"""

import importlib

from selenium.common.exceptions import StaleElementReferenceException
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from behave import use_step_matcher

from admin.models import Lecture
from tests import common_helpers
from tests.ui_steps import helpers


def _import_steps(name):
    # kroky modulu se registruji s matcherem platnym pri importu a moduly koncí na "re";
    # dalsi modul (a kod za tim) musi zacit zase v "parse"
    use_step_matcher("parse")
    module = importlib.import_module(f"tests.ui_steps.{name}")
    use_step_matcher("parse")
    return module


application_ui = _import_steps("applications")
client_ui = _import_steps("clients")
group_ui = _import_steps("groups")
lecture_ui = _import_steps("lectures")


def open_wizard(driver, date):
    # prazdne date je pruvodce v zahlavi Prehledu (datum doplni uzivatel ve formulari);
    # stejny pruvodce bez data ma i prazdny stav "Nejblizsi lekce", proto se hleda v nadpisu
    scope = "[data-qa=dashboard_today_heading] " if date == "" else ""
    helpers.click(driver, f"{scope}[data-qa=button_add_lecture_wizard][data-date='{date}']")


def choose_wizard_target(driver, kind):
    """Vybere v pruvodci lekci klienta, nebo skupiny ("client"/"group" = id vyberoveho pole)."""
    helpers.click(driver, f"[data-qa=wizard_lecture_{kind}]")


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
    choose_wizard_target(context.browser, kind)
    pick_wizard_target(context.browser, kind, target)
    lecture_ui.load_data_to_context(
        context, obj, date, time, duration, "False", attendances, is_group=kind == "group"
    )
    submit_lecture(context)


def add_client_in_open_form(context, firstname, surname):
    """Prida noveho klienta (jen jmeno a prijmeni) z tlacitka v uz otevrenem formulari."""
    helpers.click(context.browser, "[data-qa=button_add_client]")
    client_ui.load_data_to_context(context, firstname, surname, "", "", "", "True")
    client_ui.insert_to_form(context)
    helpers.submit_form(context, "button_submit_client")
    # vnoreny formular klienta se zavre (a klienta preda nadrazenemu formulari) az po ulozeni
    # na serveru - do te doby jeho modal prekryva nadrazeny formular
    helpers.wait(context.browser).until_not(
        EC.presence_of_element_located((By.CSS_SELECTOR, "[data-qa=form_client]"))
    )


def add_lecture_for_new_client(context, firstname, surname, course, date, time, duration):
    open_wizard(context.browser, date)
    choose_wizard_target(context.browser, "client")
    add_client_in_open_form(context, firstname, surname)
    helpers.wait_form_ready(context.browser, "form_lecture")
    full_name = common_helpers.client_full_name(firstname, surname)
    attendances = [lecture_ui.attendance_dict(full_name, "OK", "True", "")]
    lecture_ui.load_data_to_context(context, course, date, time, duration, "False", attendances)
    submit_lecture(context)


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
    add_client_in_open_form(context, firstname, surname)


def add_lecture_for_new_group_with_new_client(
    context, group_name, course_name, firstname, surname, date, time, duration
):
    # wizard v pruvodci lekce nabizi "nebo pridejte novou skupinu" (button_add_group) misto
    # vyberu existujici - otevre stejny FormGroups jako na strance Skupiny, jen vnoreny
    # uvnitr pruvodce. Po jeho uspesnem odeslani ModalGroups svuj modal zavre, ale
    # ModalLecturesWizard.processAdditionOfGroupOrClient rovnou spusti fetch vychozich
    # hodnot lekce a vyberovy modal pritom zustava otevreny (jen s kostrou) - pocet modalu
    # tedy NIKDY neklesne na nulu (na rozdil od primeho pridani skupiny v nested.py), proto
    # nelze cekat na wait_modal_closed, ale rovnou na pripraveny formular lekce
    open_wizard(context.browser, date)
    choose_wizard_target(context.browser, "group")
    helpers.click(context.browser, "[data-qa=button_add_group]")
    fill_group_form_with_new_client(context, group_name, course_name, firstname, surname)
    helpers.submit_form(context, "button_submit_group")
    helpers.wait_form_ready(context.browser, "form_lecture")
    full_name = common_helpers.client_full_name(firstname, surname)
    attendances = [lecture_ui.attendance_dict(full_name, "OK", "True", "")]
    lecture_ui.load_data_to_context(
        context, group_name, date, time, duration, "False", attendances, is_group=True
    )
    submit_lecture(context)


def open_spotlight(driver):
    helpers.click(driver, "[data-qa=button_search]")
    # Spotlight.Search predava data-qa primo na <input>
    return helpers.wait(driver).until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, "[data-qa=spotlight_search]"))
    )


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


def edit_lecture_in_day(context, date, time, duration, note, open_day):
    """Upravi trvani a poznamku lekce v dennim prehledu (diar, Prehled) otevrenem `open_day`.

    Kurz, ucastnika, stav ucasti a platbu si zapamatuje z DB pred upravou, aby kontrola
    na karte odhalila i jejich nechtenou zmenu pri ulozeni.
    """
    lecture = Lecture.objects.select_related("course").get(
        start=common_helpers.prepare_start(date, time)
    )
    attendance = lecture.attendances.select_related("client", "attendancestate").get()
    attendances = [
        lecture_ui.attendance_dict(
            common_helpers.client_full_name(attendance.client.firstname, attendance.client.surname),
            attendance.attendancestate.name,
            attendance.paid,
            note,
        )
    ]
    open_day()
    lecture_div = helpers.wait(
        context.browser, helpers.WAIT_TIME, ignored_exceptions=(StaleElementReferenceException,)
    ).until(
        lambda driver: next(
            (
                element
                for element in driver.find_elements(By.CSS_SELECTOR, "[data-qa=lecture]")
                if element.find_element(By.CSS_SELECTOR, "[data-qa=lecture_start]").text == time
            ),
            False,
        )
    )
    lecture_div.find_element(By.CSS_SELECTOR, "[data-qa=button_edit_lecture]").click()
    helpers.wait_form_ready(context.browser, "form_lecture")
    duration_field = context.browser.find_element(
        By.CSS_SELECTOR, "[data-qa=lecture_field_duration]"
    )
    helpers.clear_input(duration_field)
    duration_field.send_keys(duration)
    note_field = context.browser.find_element(
        By.CSS_SELECTOR, "[data-qa=lecture_field_attendance_note]"
    )
    helpers.clear_input(note_field)
    note_field.send_keys(note)
    helpers.submit_form(context, "button_submit_lecture")
    helpers.wait_modal_closed(context.browser)
    lecture_ui.load_data_to_context(
        context, lecture.course.name, date, time, duration, str(lecture.canceled), attendances
    )
