from behave import *
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.common.exceptions import TimeoutException
from tests.ui_steps import helpers
from tests import common_helpers
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import Select
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


def get_paid_button(driver):
    return driver.find_element_by_css_selector(
        '[data-qa=lecture_attendance_paid]')


def get_select_attendancestates(driver):
    return Select(driver.find_element_by_css_selector(
        '[data-qa=lecture_select_attendance_attendancestate]'))


def find_lecture(context, date, time, validate_context=False):
    all_courses = context.browser.find_elements_by_css_selector('[data-qa=card_course]')
    for course in all_courses:
        found_course = course.find_element_by_css_selector('[data-qa=card_course_name]').text
        all_course_lectures = course.find_elements_by_css_selector('[data-qa=lecture]')
        # najdi lekci s danym zacatkem
        for lecture in all_course_lectures:
            found_start = lecture.find_element_by_css_selector('[data-qa=lecture_start]').text
            found_duration = lecture.find_element_by_css_selector(
                '[data-qa=lecture_start]').get_attribute('title')
            # srovnej identifikatory
            start = common_helpers.prepare_start(date, time)
            start = f"{start.day}. {start.month}. {start.year} – {start.hour}:{start.minute:02}"
            # je to substring?
            if start in found_start:
                # identifikatory sedi, otestuj pripadna dalsi data z kontextu nebo rovnou vrat nalezeny prvek
                if validate_context:
                    found_attendances_cnt = 0
                    for attendance in context.attendances:
                        # najdi attendance prislusici danemu klientovi
                        found_attendance = find_attendance_in_card(context, lecture, attendance['client'])
                        found_note = found_attendance.find_element_by_css_selector(
                            '[data-qa=lecture_attendance_note]').text
                        if (found_note == attendance['note'] and
                                verify_paid(found_attendance, attendance['paid']) and
                                verify_attendancestate(found_attendance, attendance['attendancestate'])):
                            found_attendances_cnt += 1
                    if (found_attendances_cnt == len(context.attendances) and
                            context.duration in found_duration):
                        # pro single lekce srovnej kurz
                        if not context.is_group and found_course != context.course:
                            return False
                        # pro skupiny jeste over canceled
                        canceled_classes = lecture.get_attribute("class")
                        expected_canceled_class = "lecture-canceled"
                        if (context.canceled and not helpers.check_class_included(canceled_classes,
                                                                                  expected_canceled_class) or
                                not context.canceled and helpers.check_class_included(canceled_classes,
                                                                                      expected_canceled_class)):
                            return False
                        return lecture
                else:
                    return lecture
    return False


def find_lecture_with_context(context):
    return find_lecture(context, context.date, context.time, validate_context=True)


def wait_form_visible(driver):
    WebDriverWait(driver, helpers.WAIT_TIME).until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-qa=form_lecture]')))


def find_attendance_in_form(context, client):
    if not context.is_group:
        return context.browser.find_element_by_css_selector('[data-qa=form_lecture_attendance]')
    all_attendances = context.browser.find_elements_by_css_selector('[data-qa=form_lecture_attendance]')
    for attendance in all_attendances:
        if attendance.find_element_by_css_selector('[data-qa=client_name]').text == client:
            return attendance
    return None


def find_attendance_in_card(context, lecture, client):
    if not context.is_group:
        return lecture.find_element_by_css_selector('[data-qa=lecture_attendance]')
    all_attendances = lecture.find_elements_by_css_selector('[data-qa=lecture_attendance]')
    for attendance in all_attendances:
        if attendance.find_element_by_css_selector('[data-qa=client_name]').text == client:
            return attendance
    return None


def insert_to_form(context):
    # pockej az bude viditelny formular
    wait_form_visible(context.browser)
    # vloz vsechny udaje do formulare
    date_field = context.browser.find_element_by_css_selector('[data-qa=lecture_field_date]')
    time_field = context.browser.find_element_by_css_selector('[data-qa=lecture_field_time]')
    duration_field = context.browser.find_element_by_css_selector('[data-qa=lecture_field_duration]')
    canceled_checkbox = context.browser.find_element_by_css_selector('[data-qa=lecture_checkbox_canceled]')
    canceled_label = context.browser.find_element_by_css_selector('[data-qa=lecture_label_canceled]')
    # pokud se nejedna o skupinu, vloz i kurz
    if not context.is_group:
        course_field = context.browser.find_element_by_id('course')
        course_field.send_keys(Keys.BACK_SPACE)
        helpers.react_select_insert(context.browser, course_field, context.course)
    # smaz vsechny udaje
    date_field.clear()
    time_field.clear()
    duration_field.clear()
    # vloz nove udaje
    date_field.send_keys(context.date)
    time_field.send_keys(context.time)
    duration_field.send_keys(context.duration)
    if ((context.canceled and not canceled_checkbox.is_selected()) or
            (not context.canceled and canceled_checkbox.is_selected())):
        canceled_label.click()
    for attendance in context.attendances:
        # najdi attendance prislusici danemu klientovi
        found_attendance = find_attendance_in_form(context, attendance['client'])
        paid_checkbox = found_attendance.find_element_by_css_selector('[data-qa=lecture_checkbox_attendance_paid')
        paid_label = found_attendance.find_element_by_css_selector('[data-qa=lecture_label_attendance_paid')
        note_field = found_attendance.find_element_by_css_selector('[data-qa=lecture_field_attendance_note')
        # smazani stavajicich udaju
        note_field.clear()
        # vlozeni novych udaju
        if ((attendance['paid'] and not paid_checkbox.is_selected()) or
                (not attendance['paid'] and paid_checkbox.is_selected())):
            paid_label.click()
        note_field.send_keys(attendance['note'])
        choose_attendancestate(found_attendance, attendance['attendancestate'])
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


def verify_paid(found_attendance, new_paid):
    found_paid_classes = get_paid_button(found_attendance).get_attribute('class')
    expected_paid_class = "text-success" if new_paid else "text-danger"
    return helpers.check_class_included(found_paid_classes, expected_paid_class)


def verify_attendancestate(found_attendance, new_attendancestate):
    # uloz si nalezene atributy ucasti
    found_attendancestate_selected_list = get_select_attendancestates(found_attendance).all_selected_options
    found_attendancestate_selected_list = [elem.text for elem in
                                           found_attendancestate_selected_list]
    return (len(found_attendancestate_selected_list) == 1 and
            new_attendancestate in found_attendancestate_selected_list)


def choose_attendancestate(found_attendance, new_attendancestate):
    attendancestate_select = Select(found_attendance.find_element_by_css_selector(
        '[data-qa=lecture_select_attendance_attendancestate'))
    attendancestate_select.select_by_visible_text(new_attendancestate)


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


@then('the paid state of the attendance is updated')
def step_impl(context):
    # pockej na update lekci
    helpers.wait_loading_cycle(context.browser)
    # najdi upravovanou lekci
    lecture_to_update = find_lecture(context, context.date, context.time)
    assert lecture_to_update
    # ma lekce opravdu nove udaje?
    assert verify_paid(lecture_to_update, context.new_paid)


@then('the attendance state of the attendance is updated')
def step_impl(context):
    # pockej na update lekci
    helpers.wait_loading_cycle(context.browser)
    # najdi upravovanou lekci
    lecture_to_update = find_lecture(context, context.date, context.time)
    assert lecture_to_update
    # ma lekce opravdu nove udaje?
    assert verify_attendancestate(lecture_to_update, context.new_attendancestate)


@then('the lecture is deleted')
def step_impl(context):
    # pockej na smazani lekce
    WebDriverWait(context.browser, helpers.WAIT_TIME).until(
        lambda driver: lectures_cnt(driver) < context.old_lectures_cnt)
    # je lekce opravdu smazana?
    assert not find_lecture(context, context.date, context.time)


@when('user deletes the lecture of the client "{client}" at "{date}", "{time}"')
def step_impl(context, client, date, time):
    # nacti timestamp lekce do kontextu
    load_id_data_to_context(context, date, time)
    # otevri kartu prislusneho klienta
    open_client_card(context.browser, client)
    # pockej na nacteni
    helpers.wait_loading_ends(context.browser)
    # najdi lekci a klikni u ni na Upravit
    lecture_to_update = find_lecture(context, date, time)
    assert lecture_to_update
    button_edit_lecture = lecture_to_update.find_element_by_css_selector('[data-qa=button_edit_lecture]')
    button_edit_lecture.click()
    # pockej na nacteni
    helpers.wait_loading_ends(context.browser)
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
    lecture_to_update = find_lecture(context, date, time)
    assert lecture_to_update
    button_edit_lecture = lecture_to_update.find_element_by_css_selector('[data-qa=button_edit_lecture]')
    button_edit_lecture.click()
    # pockej na nacteni
    helpers.wait_loading_ends(context.browser)
    # uloz puvodni pocet skupin
    save_old_lectures_cnt_to_context(context)
    # vloz vsechny udaje do formulare
    last_field = insert_to_form(context)
    # odesli formular
    last_field.submit()


@when(
    'user updates the paid state of lecture of the client "{client}" at "{date}", "{time}" to "{new_paid}"')
def step_impl(context, client, date, time, new_paid):
    # nacteni dat lekce do kontextu
    load_id_data_to_context(context, date, time)
    # otevri kartu prislusneho klienta
    open_client_card(context.browser, client)
    # pockej na nacteni
    helpers.wait_loading_ends(context.browser)
    # najdi lekci a klikni u ni na tlacitko platby
    lecture_to_update = find_lecture(context, date, time)
    assert lecture_to_update
    button_paid = get_paid_button(lecture_to_update)
    button_paid.click()
    # uloz ocekavany novy stav do kontextu
    context.new_paid = common_helpers.to_bool(new_paid)


@when(
    'user updates the attendance state of lecture of the client "{client}" at "{date}", "{time}" to "{new_attendancestate}"')
def step_impl(context, client, date, time, new_attendancestate):
    # nacteni dat lekce do kontextu
    load_id_data_to_context(context, date, time)
    # otevri kartu prislusneho klienta
    open_client_card(context.browser, client)
    # pockej na nacteni
    helpers.wait_loading_ends(context.browser)
    # najdi lekci a vyber novy stav ucasti
    lecture_to_update = find_lecture(context, date, time)
    assert lecture_to_update
    choose_attendancestate(lecture_to_update, new_attendancestate)
    # uloz ocekavany novy stav do kontextu
    context.cur_attendancestate = get_select_attendancestates(lecture_to_update).all_selected_options
    context.new_attendancestate = new_attendancestate


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
