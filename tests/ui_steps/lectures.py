from behave import *
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.common.exceptions import TimeoutException
from tests.ui_steps import helpers
from tests import common_helpers
from selenium.webdriver.common.keys import Keys
from tests.common_steps import lectures
from tests.ui_steps import login_logout


def get_lectures(driver):
    return driver.find_elements_by_css_selector('[data-qa=lecture]')


def lectures_cnt(driver):
    return len(get_lectures(driver))


def open_group_card(driver, name):
    # otevri skupiny z menu
    helpers.open_groups(driver)
    # pockej na nacteni
    helpers.wait_loading_ends(driver)
    # najdi skupinu s danym nazvem
    all_groups = helpers.get_groups(driver)
    found_group_success = False
    for group in all_groups:
        found_name = group.find_element_by_css_selector('[data-qa=group_name]')
        # srovnej identifikator
        if found_name.text == name:
            found_name.click()
            found_group_success = True
            break
    assert found_group_success


def open_client_card(driver, name):
    # otevri klienty z menu
    helpers.open_clients(driver)
    # pockej na nacteni
    helpers.wait_loading_ends(driver)
    # najdi klienta s danym jmenem
    all_clients = helpers.get_clients(driver)
    found_client_success = False
    for client in all_clients:
        found_full_name = client.find_element_by_css_selector('[data-qa=client_name]')
        # srovnej identifikator
        if found_full_name.text == name:
            found_full_name.click()
            found_client_success = True
            break
    assert found_client_success


def find_lecture(driver, date, time, **data):
    all_lectures = get_lectures(driver)
    # najdi skupinu s danym nazvem
    for lecture in all_lectures:
        found_start = lecture.find_element_by_css_selector('[data-qa=lecture_start]').text
        # srovnej identifikatory
        start = common_helpers.prepare_start(date, time)
        start = f"{start.day}. {start.month}. {start.year} – {start.hour}:{start.minute:02}"
        # je to substring?
        if start in found_start:
            # identifikatory sedi, otestuj pripadna dalsi zaslana data nebo rovnou vrat nalezeny prvek
            if data:
                ...
                # todo
                """found_course = lecture.find_element_by_css_selector('[data-qa=course_name]').text
                found_memberships_elements = lecture.find_elements_by_css_selector('[data-qa=client_name]')
                found_memberships = [element.text for element in found_memberships_elements]
                if (set(found_memberships) == set(data['memberships']) and
                        found_course == data['course']):
                    return lecture"""
                return lecture
            else:
                return lecture
    return False


def find_lecture_with_context(context):
    obj = context.course if not context.is_group else None
    return find_lecture(context.browser, context.date, context.time, obj=obj, canceled=context.canceled,
                        attendances=context.attendances)


def wait_form_visible(driver):
    WebDriverWait(driver, helpers.WAIT_TIME).until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-qa=form_lecture]')))


def insert_to_form(context):
    # pockej az bude viditelny formular
    wait_form_visible(context.browser)
    # vloz vsechny udaje do formulare
    date_field = context.browser.find_element_by_css_selector('[data-qa=lecture_field_date]')
    time_field = context.browser.find_element_by_css_selector('[data-qa=lecture_field_time]')
    duration_field = context.browser.find_element_by_css_selector('[data-qa=lecture_field_duration]')
    canceled_checkbox = context.browser.find_element_by_css_selector('[data-qa=lecture_checkbox_canceled]')
    canceled_label = context.browser.find_element_by_css_selector('[data-qa=lecture_label_canceled]')
    # smaz vsechny udaje
    date_field.clear()
    time_field.clear()
    duration_field.clear()
    # vloz nove udaje
    date_field.send_keys(context.date)
    time_field.send_keys(context.time)
    duration_field.send_keys(context.duration)
    # pokud se nejedna o skupinu, vloz i kurz
    if not context.is_group:
        course_field = context.browser.find_element_by_id('course')
        course_field.send_keys(Keys.BACK_SPACE)
        helpers.react_select_insert(context.browser, course_field, context.course)
    if ((context.canceled and not canceled_checkbox.is_selected()) or
            (not context.canceled and canceled_checkbox.is_selected())):
        canceled_label.click()
    for attendance in context.attendances:
        ...
        # todo
    # vrat posledni element
    return duration_field


def load_data_to_context(context, obj, date, time, duration, canceled, attendances, is_group=False):
    load_id_data_to_context(context, date, time)
    # pro skupinu je potreba ulozit skupinu, pro jednotlivce pouze kurz (klient je v attendances)
    if is_group:
        context.group = obj
    else:
        context.course = obj
    context.is_group = is_group
    context.attendances = attendances
    context.duration = duration
    context.canceled = common_helpers.to_bool(canceled)


def load_id_data_to_context(context, date, time):
    context.date = date
    context.time = time


def save_old_lectures_cnt_to_context(context):
    context.old_lectures_cnt = lectures_cnt(context.browser)


def attendance_dict(client, attendancestate, paid, note):
    return {'client': client,
            'attendancestate': attendancestate,
            'paid': common_helpers.to_bool(paid),
            'note': note}


@then('the lecture is added')
def step_impl(context):
    # pockej na pridani lekce
    WebDriverWait(context.browser, helpers.WAIT_TIME).until(
        lambda driver: lectures_cnt(driver) > context.old_lectures_cnt)
    # je lekce opravdu pridana?
    assert find_lecture_with_context(context)


@then('the lecture is updated')
def step_impl(context):
    # pockej na update lekci
    helpers.wait_loading_cycle(context.browser)
    # ma lekce opravdu nove udaje?
    assert find_lecture_with_context(context)
    assert lectures_cnt(context.browser) == context.old_lectures_cnt


@then('the lecture is deleted')
def step_impl(context):
    # pockej na smazani lekce
    WebDriverWait(context.browser, helpers.WAIT_TIME).until(
        lambda driver: lectures_cnt(driver) < context.old_lectures_cnt)
    # je lekce opravdu smazana?
    assert not find_lecture(context.browser, context.date, context.time)


@when('user deletes the lecture of the client "{client}" at "{date}", "{time}"')
def step_impl(context, client, date, time):
    # nacti timestamp lekce do kontextu
    load_id_data_to_context(context, date, time)
    # otevri kartu prislusneho klienta
    open_client_card(context.browser, client)
    # pockej na nacteni
    helpers.wait_loading_ends(context.browser)
    # najdi lekci a klikni u ni na Upravit
    lecture_to_update = find_lecture(context.browser, date, time)
    assert lecture_to_update
    button_edit_lecture = lecture_to_update.find_element_by_css_selector('[data-qa=button_edit_lecture]')
    button_edit_lecture.click()
    # uloz puvodni pocet lekci
    save_old_lectures_cnt_to_context(context)
    # pockej az bude viditelny formular
    wait_form_visible(context.browser)
    # klikni na smazat
    button_delete_lecture = context.browser.find_element_by_css_selector('[data-qa=button_delete_lecture]')
    button_delete_lecture.click()
    # a potvrd smazani
    helpers.wait_for_alert_and_accept(context.browser)


@then('the lecture is not added')
def step_impl(context):
    # zjisti, zda stale sviti formular a zadna lekce nepribyla
    try:
        WebDriverWait(context.browser, helpers.WAIT_TIME_SHORT).until_not(
            EC.presence_of_element_located((By.CSS_SELECTOR, '[data-qa=form_lecture]')))
        form_group_visible = False
    except TimeoutException:
        form_group_visible = True
    assert form_group_visible
    assert lectures_cnt(context.browser) == context.old_lectures_cnt


@when(
    'user updates the data of lecture at "{date}", "{time}" to date "{new_date}", time "{new_time}", course "{new_course}", duration "{new_duration}", canceled "{new_canceled}", attendance of the client "{client}" is: "{new_attendancestate}", paid "{new_paid}", note "{new_note}"')
def step_impl(context, date, time, new_date, new_time, new_course, new_duration, new_canceled, client,
              new_attendancestate, new_paid, new_note):
    new_attendances = [attendance_dict(client, new_attendancestate, new_paid, new_note)]
    # nacti data skupiny do kontextu
    load_data_to_context(context, new_course, new_date, new_time, new_duration, new_canceled, new_attendances)
    # otevri kartu prislusneho klienta
    open_client_card(context.browser, client)
    # pockej na nacteni
    helpers.wait_loading_ends(context.browser)
    # najdi lekci a klikni u ni na Upravit
    lecture_to_update = find_lecture(context.browser, date, time)
    assert lecture_to_update
    button_edit_lecture = lecture_to_update.find_element_by_css_selector('[data-qa=button_edit_lecture]')
    button_edit_lecture.click()
    # uloz puvodni pocet skupin
    save_old_lectures_cnt_to_context(context)
    # vloz vsechny udaje do formulare
    last_field = insert_to_form(context)
    # odesli formular
    last_field.submit()


use_step_matcher("re")


@when(
    'user adds new group lecture for group "(?P<group>.*)" with date "(?P<date>.*)", time "(?P<time>.*)", duration "(?P<duration>.*)", canceled "(?P<canceled>.*)", attendance of the client "(?P<client1>.*)" is: "(?P<attendancestate1>.*)", paid "(?P<paid1>.*)", note "(?P<note1>.*)" and attendance of the client "(?P<client2>.*)" is: "(?P<attendancestate2>.*)", paid "(?P<paid2>.*)", note "(?P<note2>.*)"')
def step_impl(context, group, date, time, duration, canceled, client1, attendancestate1, paid1, note1, client2,
              attendancestate2, paid2, note2):
    attendances = [attendance_dict(client1, attendancestate1, paid1, note1),
                   attendance_dict(client2, attendancestate2, paid2, note2)]
    # nacti data lekce do kontextu
    load_data_to_context(context, group, date, time, duration, canceled, attendances, is_group=True)
    # otevri kartu prislusne skupiny
    open_group_card(context.browser, group)
    # pockej na nacteni a pak klikni na Pridat lekci
    helpers.wait_loading_ends(context.browser)
    button_add_lecture = context.browser.find_element_by_css_selector('[data-qa=button_add_lecture]')
    button_add_lecture.click()
    # uloz puvodni pocet lekci
    save_old_lectures_cnt_to_context(context)
    # vloz vsechny udaje do formulare
    last_field = insert_to_form(context)
    # odesli formular
    last_field.submit()


@when(
    'user adds new single lecture for client "(?P<client>.*)" for course "(?P<course>.*)" with date "(?P<date>.*)", time "(?P<time>.*)", duration "(?P<duration>.*)", canceled "(?P<canceled>.*)", attendance of the client is: "(?P<attendancestate>.*)", paid "(?P<paid>.*)", note "(?P<note>.*)"')
def step_impl(context, client, course, date, time, duration, canceled, attendancestate, paid, note):
    attendances = [attendance_dict(client, attendancestate, paid, note)]
    # nacti data lekce do kontextu
    load_data_to_context(context, course, date, time, duration, canceled, attendances)
    # otevri kartu prislusneho klienta
    open_client_card(context.browser, client)
    # pockej na nacteni a pak klikni na Pridat lekci
    helpers.wait_loading_ends(context.browser)
    button_add_lecture = context.browser.find_element_by_css_selector('[data-qa=button_add_lecture]')
    button_add_lecture.click()
    # uloz puvodni pocet lekci
    save_old_lectures_cnt_to_context(context)
    # vloz vsechny udaje do formulare
    last_field = insert_to_form(context)
    # odesli formular
    last_field.submit()
