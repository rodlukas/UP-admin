from behave import when, then, use_step_matcher
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select, WebDriverWait

from tests import common_helpers

# noinspection PyUnresolvedReferences
from tests.common_steps import lectures

# noinspection PyUnresolvedReferences
from tests.ui_steps import helpers, login_logout


def get_lectures(driver):
    return driver.find_elements(By.CSS_SELECTOR, "[data-qa=lecture]")


def lectures_cnt(driver):
    return len(get_lectures(driver))


def open_group_card(context, name):
    # otevri skupiny z menu
    helpers.open_groups(context.browser)
    # pockej na nacteni
    helpers.wait_loading_ends(context.browser)
    # najdi skupinu s danym nazvem a otevri jeji kartu
    found_group = helpers.find_group(context, name, True)
    return found_group


def open_client_card(context, full_name):
    # otevri klienty z menu
    helpers.open_clients(context.browser)
    # pockej na nacteni
    helpers.wait_loading_ends(context.browser)
    # najdi klienta s danym jmenem a otevri jeho kartu
    found_client = helpers.find_client(context, full_name, True)
    return found_client


def get_paid_button(driver):
    return driver.find_element(By.CSS_SELECTOR, "[data-qa=lecture_attendance_paid]")


def duration_title(duration):
    return "Trvání: " + duration + " min."


def get_select_attendancestates(driver):
    return Select(
        driver.find_element(By.CSS_SELECTOR, "[data-qa=lecture_select_attendance_attendancestate]")
    )


def find_lecture(context, date, time, validate_context=False):
    all_courses = context.browser.find_elements(By.CSS_SELECTOR, "[data-qa=card_course]")
    # hledej mezi vsemi kurzy
    for course in all_courses:
        found_course = course.find_element(By.CSS_SELECTOR, "[data-qa=card_course_name]").text
        all_course_lectures = course.find_elements(By.CSS_SELECTOR, "[data-qa=lecture]")
        # najdi lekci s danym zacatkem
        for lecture in all_course_lectures:
            found_start = lecture.find_element(By.CSS_SELECTOR, "[data-qa=lecture_start]").text
            found_duration = helpers.get_tooltip(
                context.browser, lecture.find_element(By.CSS_SELECTOR, "[data-qa=lecture_start]")
            ).text
            found_canceled = helpers.check_class_included(
                lecture.get_attribute("class"), "lecture-canceled"
            )
            # srovnej identifikatory
            start = common_helpers.prepare_start(date, time)
            start = f"{start.day}. {start.month}. {start.year} – {start.hour}:{start.minute:02}"
            # je to substring (v UI je pred datumem i nazev dne)?
            if start in found_start:
                # prohledej a zvaliduj attendances (jen kdyz jsou k dispozici)
                found_attendances_cnt = 0
                found_old_attendances = []
                if "attendances" in context:
                    for attendance in context.attendances:
                        # najdi attendance prislusici danemu klientovi
                        found_attendance = find_attendance_in_card(
                            context, lecture, attendance["client"]
                        )
                        found_note = found_attendance.find_element(
                            By.CSS_SELECTOR, "[data-qa=lecture_attendance_note]"
                        ).text
                        found_old_attendances.append(
                            attendance_dict(
                                attendance["client"],
                                get_attendancestate_state(found_attendance),
                                get_paid_state(found_attendance),
                                found_note,
                            )
                        )
                        if (
                            found_note == attendance["note"]
                            and verify_paid(found_attendance, attendance["paid"])
                            and verify_attendancestate(
                                found_attendance, attendance["attendancestate"]
                            )
                        ):
                            found_attendances_cnt += 1
                # identifikatory sedi, otestuj pripadna dalsi data z kontextu (pokud nesedi, hledej dal)
                # nebo rovnou vrat nalezeny prvek
                if validate_context and (
                    found_attendances_cnt != len(context.attendances)
                    or duration_title(context.duration) != found_duration
                ):
                    continue
                if (
                    # poznamka: uz vime, ze se attendances i duration sedi (jinak predchozi podminka zaridi continue)
                    not validate_context
                    or validate_context
                    and (
                        # jeste over spravnou hodnotu canceled
                        context.canceled == found_canceled
                        # pro single lekce srovnej kurz, pro skupiny ho neres
                        and (not context.is_group and found_course == context.course)
                        or context.is_group
                    )
                ):
                    # uloz stara data do kontextu pro pripadne overeni spravnosti
                    context.old_attendances = found_old_attendances
                    context.old_course = found_course
                    context.old_date = date
                    context.old_time = time
                    context.old_duration = found_duration
                    context.old_canceled = found_canceled
                    return lecture
    return False


def find_lecture_with_context(context):
    return find_lecture(context, context.date, context.time, validate_context=True)


def wait_form_visible(driver):
    WebDriverWait(driver, helpers.WAIT_TIME).until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, "[data-qa=form_lecture]"))
    )


def find_attendance_in_form(context, client):
    if not context.is_group:
        return context.browser.find_element(By.CSS_SELECTOR, "[data-qa=form_lecture_attendance]")
    all_attendances = context.browser.find_elements(
        By.CSS_SELECTOR, "[data-qa=form_lecture_attendance]"
    )
    for attendance in all_attendances:
        if attendance.find_element(By.CSS_SELECTOR, "[data-qa=client_name]").text == client:
            return attendance
    return None


def find_attendance_in_card(context, lecture, client):
    if not context.is_group:
        return lecture.find_element(By.CSS_SELECTOR, "[data-qa=lecture_attendance]")
    all_attendances = lecture.find_elements(By.CSS_SELECTOR, "[data-qa=lecture_attendance]")
    for attendance in all_attendances:
        if attendance.find_element(By.CSS_SELECTOR, "[data-qa=client_name]").text == client:
            return attendance
    return None


def insert_to_form(context, verify_current_data=False):
    # pockej az bude viditelny formular
    wait_form_visible(context.browser)
    # priprav pole z formulare
    date_field = context.browser.find_element(By.CSS_SELECTOR, "[data-qa=lecture_field_date]")
    time_field = context.browser.find_element(By.CSS_SELECTOR, "[data-qa=lecture_field_time]")
    duration_field = context.browser.find_element(
        By.CSS_SELECTOR, "[data-qa=lecture_field_duration]"
    )
    canceled_checkbox = context.browser.find_element(
        By.CSS_SELECTOR, "[data-qa=lecture_checkbox_canceled]"
    )
    canceled_label = context.browser.find_element(
        By.CSS_SELECTOR, "[data-qa=lecture_label_canceled]"
    )
    course_field = context.browser.find_element(By.ID, "course")
    # over, ze aktualne zobrazene udaje ve formulari jsou spravne (krome attendancestates - viz nize)
    if verify_current_data:
        # ziskej aktualni hodnoty z react-selectu
        course_field_value = context.browser.find_element(
            By.CSS_SELECTOR, ".course__single-value"
        ).text
        assert (
            context.old_course == course_field_value
            and context.old_date == date_field.get_attribute("value")
            and context.old_time == time_field.get_attribute("value")
            and context.old_duration == duration_title(duration_field.get_attribute("value"))
            and context.old_canceled == canceled_checkbox.is_selected()
        )
    # pokud se nejedna o skupinu, vloz i kurz
    if not context.is_group:
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
    if (context.canceled and not canceled_checkbox.is_selected()) or (
        not context.canceled and canceled_checkbox.is_selected()
    ):
        canceled_label.click()
    for attendance in context.attendances:
        # najdi attendance prislusici danemu klientovi
        found_attendance = find_attendance_in_form(context, attendance["client"])
        paid_checkbox = found_attendance.find_element(
            By.CSS_SELECTOR, "[data-qa=lecture_checkbox_attendance_paid]"
        )
        paid_label = found_attendance.find_element(
            By.CSS_SELECTOR, "[data-qa=lecture_label_attendance_paid]"
        )
        note_field = found_attendance.find_element(
            By.CSS_SELECTOR, "[data-qa=lecture_field_attendance_note]"
        )
        # over, ze aktualne zobrazena attendances pro daneho klienta je spravna
        if verify_current_data:
            # najdi puvodni hodnoty prislusne attendance
            old_attendance_of_client = next(
                old_attendance
                for old_attendance in context.old_attendances
                if old_attendance["client"] == attendance["client"]
            )
            # srovnej puvodni attendance s aktualnimi hodnotami attendance
            assert old_attendance_of_client == attendance_dict(
                attendance["client"],
                get_attendancestate_state(found_attendance),
                paid_checkbox.is_selected(),
                note_field.get_attribute("value"),
            )
        # smazani stavajicich udaju
        note_field.clear()
        # vlozeni novych udaju
        if (attendance["paid"] and not paid_checkbox.is_selected()) or (
            not attendance["paid"] and paid_checkbox.is_selected()
        ):
            paid_label.click()
        note_field.send_keys(attendance["note"])
        choose_attendancestate(found_attendance, attendance["attendancestate"])


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
    return {
        "client": client,
        "attendancestate": attendancestate,
        "paid": paid if isinstance(paid, bool) else common_helpers.to_bool(paid),
        "note": note,
    }


def get_paid_state(found_attendance):
    return helpers.check_class_included(
        get_paid_button(found_attendance).get_attribute("class"), "text-success"
    )


def get_attendancestate_state(found_attendance):
    # uloz si nalezene atributy ucasti
    found_attendancestate_selected_list = get_select_attendancestates(
        found_attendance
    ).all_selected_options
    assert len(found_attendancestate_selected_list) == 1
    return found_attendancestate_selected_list[0].text


def verify_paid(found_attendance, new_paid):
    return get_paid_state(found_attendance) == new_paid


def verify_attendancestate(found_attendance, new_attendancestate):
    return new_attendancestate == get_attendancestate_state(found_attendance)


def choose_attendancestate(found_attendance, new_attendancestate):
    attendancestate_select = Select(
        found_attendance.find_element(
            By.CSS_SELECTOR, "[data-qa=lecture_select_attendance_attendancestate"
        )
    )
    attendancestate_select.select_by_visible_text(new_attendancestate)


@then("the lecture is added")
def step_impl(context):
    # pockej na pridani lekce
    WebDriverWait(context.browser, helpers.WAIT_TIME).until(
        lambda driver: lectures_cnt(driver) > context.old_lectures_cnt
    )
    helpers.wait_modal_closed(context.browser)
    # je lekce opravdu pridana?
    assert find_lecture_with_context(context)


@then("the lecture is updated")
def step_impl(context):
    # pockej na update lekci
    helpers.wait_loading_cycle(context.browser)
    # pockej na zavreni modalu
    helpers.wait_modal_closed(context.browser)
    # ma lekce opravdu nove udaje?
    assert find_lecture_with_context(context)
    assert lectures_cnt(context.browser) == context.old_lectures_cnt


@then("the paid state of the attendance is updated")
def step_impl(context):
    # pockej na update lekci
    helpers.wait_loading_cycle(context.browser)
    # najdi upravovanou lekci
    lecture_to_update = find_lecture(context, context.date, context.time)
    assert lecture_to_update
    # ma lekce opravdu nove udaje?
    assert verify_paid(lecture_to_update, context.new_paid)


@then("the attendance state of the attendance is updated")
def step_impl(context):
    # pockej na update lekci
    helpers.wait_loading_cycle(context.browser)
    # najdi upravovanou lekci
    lecture_to_update = find_lecture(context, context.date, context.time)
    assert lecture_to_update
    # ma lekce opravdu nove udaje?
    assert verify_attendancestate(lecture_to_update, context.new_attendancestate)
    # pokud se lekce nove zmenila na omluvenou a byla zaplacena, over pridani nahradni lekce
    excused_attendancestate = common_helpers.get_excused_attendancestate()
    if (
        context.cur_attendancestate != excused_attendancestate
        and context.new_attendancestate == excused_attendancestate
        and verify_paid(lecture_to_update, True)
    ):
        assert lectures_cnt(context.browser) == context.old_lectures_cnt + 1
    else:
        assert lectures_cnt(context.browser) == context.old_lectures_cnt


@then("the lecture is deleted")
def step_impl(context):
    # pockej na smazani lekce
    WebDriverWait(context.browser, helpers.WAIT_TIME).until(
        lambda driver: lectures_cnt(driver) < context.old_lectures_cnt
    )
    helpers.wait_modal_closed(context.browser)
    # je lekce opravdu smazana?
    assert not find_lecture(context, context.date, context.time)


@when('user deletes the lecture of the client "{client}" at "{date}", "{time}"')
def step_impl(context, client, date, time):
    # nacti timestamp lekce do kontextu
    load_id_data_to_context(context, date, time)
    # otevri kartu prislusneho klienta
    open_client_card(context, client)
    # pockej na nacteni
    helpers.wait_loading_ends(context.browser)
    # najdi lekci a klikni u ni na Upravit
    lecture_to_update = find_lecture(context, date, time)
    assert lecture_to_update
    button_edit_lecture = lecture_to_update.find_element(
        By.CSS_SELECTOR, "[data-qa=button_edit_lecture]"
    )
    button_edit_lecture.click()
    # pockej na nacteni
    helpers.wait_loading_ends(context.browser)
    # uloz puvodni pocet lekci
    save_old_lectures_cnt_to_context(context)
    # pockej az bude viditelny formular
    wait_form_visible(context.browser)
    # klikni na smazat
    button_delete_lecture = context.browser.find_element(
        By.CSS_SELECTOR, "[data-qa=button_delete_lecture]"
    )
    button_delete_lecture.click()
    # a potvrd smazani
    helpers.wait_for_alert_and_accept(context.browser)


@then("the lecture is not added")
def step_impl(context):
    # zjisti, zda stale sviti formular a zadna lekce nepribyla
    try:
        WebDriverWait(context.browser, helpers.WAIT_TIME_SHORT).until_not(
            EC.presence_of_element_located((By.CSS_SELECTOR, "[data-qa=form_lecture]"))
        )
        form_group_visible = False
    except TimeoutException:
        form_group_visible = True
    assert form_group_visible
    assert lectures_cnt(context.browser) == context.old_lectures_cnt


@when(
    'user updates the data of lecture at "{date}", "{time}" to date "{new_date}", time "{new_time}", course "{new_course}", duration "{new_duration}", canceled "{new_canceled}", attendance of the client "{client}" is: "{new_attendancestate}", paid "{new_paid}", note "{new_note}"'
)
def step_impl(
    context,
    date,
    time,
    new_date,
    new_time,
    new_course,
    new_duration,
    new_canceled,
    client,
    new_attendancestate,
    new_paid,
    new_note,
):
    new_attendances = [attendance_dict(client, new_attendancestate, new_paid, new_note)]
    # nacti data skupiny do kontextu
    load_data_to_context(
        context, new_course, new_date, new_time, new_duration, new_canceled, new_attendances
    )
    # otevri kartu prislusneho klienta
    open_client_card(context, client)
    # pockej na nacteni
    helpers.wait_loading_ends(context.browser)
    # najdi lekci a klikni u ni na Upravit
    lecture_to_update = find_lecture(context, date, time)
    assert lecture_to_update
    button_edit_lecture = lecture_to_update.find_element(
        By.CSS_SELECTOR, "[data-qa=button_edit_lecture]"
    )
    button_edit_lecture.click()
    # pockej na nacteni
    helpers.wait_loading_ends(context.browser)
    # uloz puvodni pocet skupin
    save_old_lectures_cnt_to_context(context)
    # over spravne zobrazene udaje ve formulari a vloz do nej vsechny udaje
    insert_to_form(context, True)
    # odesli formular
    helpers.submit_form(context, "button_submit_lecture")


@when(
    'user updates the paid state of lecture of the client "{client}" at "{date}", "{time}" to "{new_paid}"'
)
def step_impl(context, client, date, time, new_paid):
    # nacteni dat lekce do kontextu
    load_id_data_to_context(context, date, time)
    # otevri kartu prislusneho klienta
    open_client_card(context, client)
    # pockej na nacteni
    helpers.wait_loading_ends(context.browser)
    # najdi lekci
    lecture_to_update = find_lecture(context, date, time)
    assert lecture_to_update
    # uloz ocekavany novy stav do kontextu
    context.new_paid = common_helpers.to_bool(new_paid)
    # klikni u nalezene lekce na tlacitko platby
    button_paid = get_paid_button(lecture_to_update)
    button_paid.click()


@when(
    'user updates the attendance state of lecture of the client "{client}" at "{date}", "{time}" to "{new_attendancestate}"'
)
def step_impl(context, client, date, time, new_attendancestate):
    # nacteni dat lekce do kontextu
    load_id_data_to_context(context, date, time)
    # otevri kartu prislusneho klienta
    open_client_card(context, client)
    # pockej na nacteni
    helpers.wait_loading_ends(context.browser)
    # najdi lekci
    lecture_to_update = find_lecture(context, date, time)
    assert lecture_to_update
    # uloz ocekavany novy stav do kontextu
    context.cur_attendancestate = (
        get_select_attendancestates(lecture_to_update).all_selected_options[0].text
    )
    context.new_attendancestate = new_attendancestate
    # uloz puvodni pocet lekci
    save_old_lectures_cnt_to_context(context)
    # vyber novy stav ucasti
    choose_attendancestate(lecture_to_update, new_attendancestate)


use_step_matcher("re")


@when(
    'user adds new group lecture for group "(?P<group>.*)" with date "(?P<date>.*)", time "(?P<time>.*)", duration "(?P<duration>.*)", canceled "(?P<canceled>.*)", attendance of the client "(?P<client1>.*)" is: "(?P<attendancestate1>.*)", paid "(?P<paid1>.*)", note "(?P<note1>.*)" and attendance of the client "(?P<client2>.*)" is: "(?P<attendancestate2>.*)", paid "(?P<paid2>.*)", note "(?P<note2>.*)"'
)
def step_impl(
    context,
    group,
    date,
    time,
    duration,
    canceled,
    client1,
    attendancestate1,
    paid1,
    note1,
    client2,
    attendancestate2,
    paid2,
    note2,
):
    attendances = [
        attendance_dict(client1, attendancestate1, paid1, note1),
        attendance_dict(client2, attendancestate2, paid2, note2),
    ]
    # nacti data lekce do kontextu
    load_data_to_context(context, group, date, time, duration, canceled, attendances, is_group=True)
    # otevri kartu prislusne skupiny
    open_group_card(context, group)
    # pockej na nacteni a pak klikni na Pridat lekci
    helpers.wait_loading_ends(context.browser)
    button_add_lecture = context.browser.find_element(
        By.CSS_SELECTOR, "[data-qa=button_add_lecture]"
    )
    button_add_lecture.click()
    # uloz puvodni pocet lekci
    save_old_lectures_cnt_to_context(context)
    # vloz vsechny udaje do formulare
    insert_to_form(context)
    # odesli formular
    helpers.submit_form(context, "button_submit_lecture")


@when(
    'user adds new single lecture for client "(?P<client>.*)" for course "(?P<course>.*)" with date "(?P<date>.*)", time "(?P<time>.*)", duration "(?P<duration>.*)", canceled "(?P<canceled>.*)", attendance of the client is: "(?P<attendancestate>.*)", paid "(?P<paid>.*)", note "(?P<note>.*)"'
)
def step_impl(context, client, course, date, time, duration, canceled, attendancestate, paid, note):
    attendances = [attendance_dict(client, attendancestate, paid, note)]
    # nacti data lekce do kontextu
    load_data_to_context(context, course, date, time, duration, canceled, attendances)
    # otevri kartu prislusneho klienta
    open_client_card(context, client)
    # pockej na nacteni a pak klikni na Pridat lekci
    helpers.wait_loading_ends(context.browser)
    button_add_lecture = context.browser.find_element(
        By.CSS_SELECTOR, "[data-qa=button_add_lecture]"
    )
    button_add_lecture.click()
    # uloz puvodni pocet lekci
    save_old_lectures_cnt_to_context(context)
    # vloz vsechny udaje do formulare
    insert_to_form(context)
    # odesli formular
    helpers.submit_form(context, "button_submit_lecture")
