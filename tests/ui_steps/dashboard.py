from behave import given, when

from admin.models import Attendance, AttendanceState, Client, Course, Lecture
from tests import common_helpers

from tests.ui_steps import flows
from tests.ui_steps import helpers

# noinspection PyUnresolvedReferences
from tests.ui_steps import login_logout

lecture_ui = flows.lecture_ui


@when(
    'user adds a single lecture from the dashboard on "{date}" at "{time}" for "{full_name}"'
    ' in course "{course_name}" with duration "{duration}"'
)
def step_impl(context, date, time, full_name, course_name, duration):
    # po prihlaseni je uzivatel uz na Prehledu (hlavicka ma pruvodce bez predvyplneneho data)
    helpers.wait_loading_ends(context.browser)
    attendances = [lecture_ui.attendance_dict(full_name, "OK", "True", "")]
    flows.add_lecture_for_existing(
        context, "client", full_name, course_name, date, time, duration, attendances, wizard_date=""
    )


@given('a lecture of "{full_name}" in course "{course_name}" today at "{time}"')
def step_impl(context, full_name, course_name, time):
    surname, firstname = full_name.split(" ", 1)
    lecture = Lecture.objects.create(
        start=common_helpers.prepare_start(common_helpers.date_today_string(), time),
        course=Course.objects.get(name=course_name),
        duration=30,
        canceled=False,
    )
    Attendance.objects.create(
        client=Client.objects.get(surname=surname, firstname=firstname),
        lecture=lecture,
        paid=True,
        attendancestate=AttendanceState.objects.get(name="OK"),
    )


def open_dashboard(context):
    # lekce vznikla az po prihlaseni - Prehled je potreba nacist znovu
    context.browser.refresh()
    helpers.wait_visible(context.browser, "dashboard_today_heading")
    helpers.wait_loading_ends(context.browser)


@when(
    'user edits today\'s lecture at "{time}" from the dashboard to duration "{duration}"'
    ' and note "{note}"'
)
def step_impl(context, time, duration, note):
    flows.edit_lecture_in_day(
        context,
        common_helpers.date_today_string(),
        time,
        duration,
        note,
        lambda: open_dashboard(context),
    )
