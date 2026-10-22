from behave import when, then
from selenium.common.exceptions import StaleElementReferenceException
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys

from tests.ui_steps import flows
from tests.ui_steps import helpers

# noinspection PyUnresolvedReferences
from tests.ui_steps import login_logout

lecture_ui = flows.lecture_ui


def prepaid_lecture_texts(driver):
    return [
        element.text
        for element in driver.find_elements(By.CSS_SELECTOR, "[data-qa=lecture_start]")
        if element.text == "Předplacená lekce"
    ]


def prepaid_counter_input(driver, full_name):
    return driver.find_element(
        By.XPATH,
        f"//*[@data-qa='membership_prepaid']"
        f"[.//*[@data-qa='client_name' and normalize-space(.)='{full_name}']]"
        "//input[@data-qa='prepaid_counter']",
    )


@when(
    'user adds {count:d} prepaid lectures for "{full_name}" in course "{course_name}" from the card'
)
def step_impl(context, count, full_name, course_name):
    assert lecture_ui.open_client_card(context, full_name)
    helpers.wait_loading_ends(context.browser)
    context.browser.find_element(By.CSS_SELECTOR, "[data-qa=button_add_lecture]").click()
    helpers.wait_form_ready(context.browser, "form_lecture")
    course_field = context.browser.find_element(By.ID, "course")
    assert helpers.combobox_insert(context.browser, course_field, course_name)
    context.browser.find_element(By.CSS_SELECTOR, "[data-qa=lecture_label_prepaid]").click()
    assert context.browser.find_element(
        By.CSS_SELECTOR, "[data-qa=lecture_checkbox_prepaid]"
    ).is_selected()
    cnt_field = context.browser.find_element(By.CSS_SELECTOR, "[data-qa=lecture_field_prepaid_cnt]")
    helpers.clear_input(cnt_field)
    cnt_field.send_keys(str(count))
    attendance = context.browser.find_element(By.CSS_SELECTOR, "[data-qa=form_lecture_attendance]")
    lecture_ui.choose_attendancestate(attendance, "OK")
    helpers.submit_form(context, "button_submit_lecture")
    helpers.wait_modal_closed(context.browser)
    helpers.wait_loading_ends(context.browser)


@then("the card shows {count:d} prepaid lectures")
def step_impl(context, count):
    helpers.wait(context.browser, helpers.WAIT_TIME).until(
        lambda driver: len(prepaid_lecture_texts(driver)) >= count
    )
    assert len(prepaid_lecture_texts(context.browser)) == count


@when(
    'user sets the prepaid counter of "{full_name}" on the card of group "{group_name}" to {count:d}'
)
def step_impl(context, full_name, group_name, count):
    assert lecture_ui.open_group_card(context, group_name)
    helpers.wait_loading_ends(context.browser)
    field = prepaid_counter_input(context.browser, full_name)
    helpers.clear_input(field)
    field.send_keys(str(count))
    # Enter pole opusti (blur) a tim spusti ulozeni; Tab by ve Firefoxu fokus nepresunul
    field.send_keys(Keys.ENTER)
    # hodnota v poli je jen lokalni stav - pockej na potvrzeni ulozeni serverem
    helpers.wait_notification(context.browser, "Předplacené lekce uloženy")


@then('the card of group "{group_name}" shows prepaid counter {count:d} for "{full_name}"')
def step_impl(context, group_name, count, full_name):
    # po reloadu se hodnota nacte ze serveru, takze dokazuje, ze se skutecne ulozila
    context.browser.refresh()
    helpers.wait_loading_ends(context.browser)
    helpers.wait(
        context.browser, helpers.WAIT_TIME, ignored_exceptions=(StaleElementReferenceException,)
    ).until(
        lambda driver: prepaid_counter_input(driver, full_name).get_attribute("value") == str(count)
    )
