from behave import when, then
from selenium.webdriver.common.by import By

from admin.models import Group, Lecture
from tests import common_helpers
from tests.ui_steps import flows
from tests.ui_steps import helpers

# noinspection PyUnresolvedReferences
from tests.ui_steps import login_logout

lecture_ui = flows.lecture_ui


def diary_title(driver):
    return driver.find_element(By.TAG_NAME, "h1").text


def open_diary_week(context, date):
    year, month, day = (int(part) for part in date.split("-"))
    context.browser.get(f"{context.base_url}/diar/{year}/{month}/{day}")
    # po plnem nacteni stranky se aplikace teprve namountuje - samotne wait_loading_ends by
    # mohlo skoncit driv, nez se nacitani vubec objevi
    helpers.wait(context.browser, helpers.WAIT_TIME).until(
        lambda driver: "Týden" in diary_title(driver)
    )
    helpers.wait_loading_ends(context.browser)


@when(
    'user adds a single lecture from the diary on "{date}" at "{time}" for "{full_name}"'
    ' in course "{course_name}" with duration "{duration}"'
)
def step_impl(context, date, time, full_name, course_name, duration):
    open_diary_week(context, date)
    attendances = [lecture_ui.attendance_dict(full_name, "OK", "True", "")]
    flows.add_lecture_for_existing(
        context, "client", full_name, course_name, date, time, duration, attendances
    )


@when(
    'user adds a group lecture from the diary on "{date}" at "{time}" for group "{group_name}"'
    ' with duration "{duration}"'
)
def step_impl(context, date, time, group_name, duration):
    open_diary_week(context, date)
    # formular po vyberu skupiny zalozi radek ucasti pro kazdeho jejiho clena
    memberships = Group.objects.get(name=group_name).memberships.select_related("client")
    attendances = [
        lecture_ui.attendance_dict(
            common_helpers.client_full_name(m.client.firstname, m.client.surname), "OK", "True", ""
        )
        for m in memberships.order_by("pk")
    ]
    flows.add_lecture_for_existing(
        context, "group", group_name, group_name, date, time, duration, attendances
    )


@when(
    'user adds a lecture from the diary on "{date}" at "{time}" for a new client "{firstname}"'
    ' "{surname}" in course "{course_name}" with duration "{duration}"'
)
def step_impl(context, date, time, firstname, surname, course_name, duration):
    open_diary_week(context, date)
    flows.add_lecture_for_new_client(
        context, firstname, surname, "", "", "", course_name, date, time, duration
    )


@when(
    'user adds a lecture from the diary on "{date}" at "{time}" for a new group "{group_name}"'
    ' in course "{course_name}" with a new client "{firstname}" "{surname}" and duration "{duration}"'
)
def step_impl(context, date, time, group_name, course_name, firstname, surname, duration):
    open_diary_week(context, date)
    flows.add_lecture_for_new_group_with_new_client(
        context, group_name, course_name, firstname, surname, date, time, duration
    )


@when(
    'user edits the lecture at "{time}" on "{date}" from the diary to duration "{duration}"'
    ' and note "{note}"'
)
def step_impl(context, time, date, duration, note):
    open_diary_week(context, date)
    lecture_div = helpers.wait(context.browser, helpers.WAIT_TIME).until(
        lambda driver: next(
            (
                lecture
                for lecture in driver.find_elements(By.CSS_SELECTOR, "[data-qa=lecture]")
                if time in lecture.text
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
    # krok meni jen trvani a poznamku - kurz, ucastnika, stav ucasti a platbu prevezme z DB
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
    lecture_ui.load_data_to_context(
        context, lecture.course.name, date, time, duration, str(lecture.canceled), attendances
    )


@when("user moves to the next diary week and back")
def step_impl(context):
    context.browser.find_element(By.CSS_SELECTOR, "[data-qa=menu_diary]").click()
    helpers.wait(context.browser, helpers.WAIT_TIME).until(
        lambda driver: "Týden" in diary_title(driver)
    )
    context.original_diary_title = diary_title(context.browser)
    context.browser.find_element(By.CSS_SELECTOR, "[data-qa=button_week_next]").click()
    helpers.wait(context.browser, helpers.WAIT_TIME).until(
        lambda driver: "Týden" in diary_title(driver)
        and diary_title(driver) != context.original_diary_title
    )
    context.browser.find_element(By.CSS_SELECTOR, "[data-qa=button_week_prev]").click()


@then("the diary title returns to the original week")
def step_impl(context):
    helpers.wait(context.browser, helpers.WAIT_TIME).until(
        lambda driver: diary_title(driver) == context.original_diary_title
    )
