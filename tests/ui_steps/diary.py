from behave import when, then
from selenium.webdriver.common.by import By

from tests.ui_steps import flows
from tests.ui_steps import helpers

# noinspection PyUnresolvedReferences
from tests.ui_steps import login_logout

lecture_ui = flows.lecture_ui


def open_diary_week(context, date):
    year, month, day = (int(part) for part in date.split("-"))
    context.browser.get(f"{context.base_url}/diar/{year}/{month}/{day}")
    # po plnem nacteni stranky se aplikace teprve namountuje - samotne wait_loading_ends by
    # mohlo skoncit driv, nez se nacitani vubec objevi
    helpers.wait(context.browser, helpers.WAIT_TIME).until(
        lambda driver: "Týden" in driver.find_element(By.TAG_NAME, "h1").text
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
    # skupina "Slabika 4" ma dva cleny (viz tests/fixtures.py groups()) - formular po jejim
    # vyberu zalozi radek ucasti pro kazdeho z nich, oba je tedy potreba vyplnit
    attendances = [
        lecture_ui.attendance_dict("Rodová Petra", "OK", "True", ""),
        lecture_ui.attendance_dict("Jirušková Aneta", "OK", "True", ""),
    ]
    flows.add_lecture_for_existing(
        context, "group", group_name, group_name, date, time, duration, attendances
    )


@then('the group lecture is on the card of "{group_name}"')
def step_impl(context, group_name):
    flows.lecture_visible_on_card(context, lecture_ui.open_group_card, group_name)


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
    # lekce Rodove Petry v "20:00" ma dle tests/fixtures.py stav "OK" a zaplaceno - ani jedno
    # se touto upravou nemeni, krok meni jen trvani a poznamku
    attendances = [lecture_ui.attendance_dict("Rodová Petra", "OK", "True", note)]
    lecture_ui.load_data_to_context(
        context, "Kurz Slabika", date, time, duration, "False", attendances
    )


@when("user moves to the next diary week and back")
def step_impl(context):
    context.browser.find_element(By.CSS_SELECTOR, "[data-qa=menu_diary]").click()
    helpers.wait_loading_ends(context.browser)
    context.original_diary_title = context.browser.find_element(By.TAG_NAME, "h1").text
    context.browser.find_element(By.CSS_SELECTOR, "[data-qa=button_week_next]").click()
    helpers.wait_loading_ends(context.browser)
    context.browser.find_element(By.CSS_SELECTOR, "[data-qa=button_week_prev]").click()
    helpers.wait_loading_ends(context.browser)


@then("the diary title returns to the original week")
def step_impl(context):
    helpers.wait(context.browser, helpers.WAIT_TIME).until(
        lambda driver: driver.find_element(By.TAG_NAME, "h1").text == context.original_diary_title
    )
