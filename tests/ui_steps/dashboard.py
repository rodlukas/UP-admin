from behave import when

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
