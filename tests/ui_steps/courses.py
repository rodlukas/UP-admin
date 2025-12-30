from behave import when, then, use_step_matcher
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

from tests import common_helpers

# noinspection PyUnresolvedReferences
from tests.common_steps import courses

# noinspection PyUnresolvedReferences
from tests.ui_steps import helpers, login_logout


def get_courses(driver):
    return driver.find_elements(By.CSS_SELECTOR, "[data-qa=course]")


def courses_cnt(driver):
    return len(get_courses(driver))


def color_title(color):
    return "Kód barvy: " + color


def find_course(context, name, **data):
    all_courses = get_courses(context.browser)
    # najdi kurz s udaji v parametrech
    for course in all_courses:
        found_name = course.find_element(By.CSS_SELECTOR, "[data-qa=course_name]").text
        # srovnej identifikatory
        if found_name == name:
            found_visible_classes = course.find_element(
                By.CSS_SELECTOR, "[data-qa=course_visible]"
            ).get_attribute("class")
            found_duration = course.find_element(By.CSS_SELECTOR, "[data-qa=course_duration]").text
            found_color = helpers.get_tooltip_text(
                context.browser, course.find_element(By.CSS_SELECTOR, "[data-qa=course_color]")
            )
            # identifikatory sedi, otestuj pripadna dalsi zaslana data nebo rovnou vrat nalezeny prvek
            if not data or (
                data
                and helpers.check_fa_bool(data["visible"], found_visible_classes)
                and found_duration == data["duration"]
                and found_color == color_title(common_helpers.color_transform(data["color"]))
            ):
                # uloz stara data do kontextu pro pripadne overeni spravnosti
                context.old_name = found_name
                context.old_visible = helpers.convert_fa_bool(found_visible_classes)
                context.old_duration = found_duration
                context.old_color = found_color
                return course
    return False


def find_course_with_context(context):
    return find_course(
        context,
        context.name,
        visible=context.visible,
        duration=context.duration,
        color=context.color,
    )


def course_color_prepare(color_picker):
    color_field = color_picker.find_element(By.CLASS_NAME, "rcp-field-input")
    return color_field


def insert_to_form(context, verify_current_data=False):
    # pockej az bude viditelny formular
    helpers.wait_form_settings_visible(context.browser)
    # priprav pole z formulare
    name_field = context.browser.find_element(By.CSS_SELECTOR, "[data-qa=settings_field_name]")
    visible_checkbox = context.browser.find_element(
        By.CSS_SELECTOR, "[data-qa=settings_checkbox_visible]"
    )
    visible_label = context.browser.find_element(
        By.CSS_SELECTOR, "[data-qa=settings_label_visible]"
    )
    duration_field = context.browser.find_element(
        By.CSS_SELECTOR, "[data-qa=settings_field_duration]"
    )
    color_picker_component = context.browser.find_element(
        By.CSS_SELECTOR, "[data-qa=settings_color_picker]"
    )  # cely widget s color pickerem
    color_field = course_color_prepare(color_picker_component)  # pole se zvolenou barvou
    color_label = context.browser.find_element(By.CSS_SELECTOR, "[data-qa=settings_label_color]")
    # over, ze aktualne zobrazene udaje ve formulari jsou spravne
    if verify_current_data:
        assert (
            context.old_name == name_field.get_attribute("value")
            and context.old_visible == visible_checkbox.is_selected()
            and context.old_duration == duration_field.get_attribute("value")
            and context.old_color == color_title(color_field.get_attribute("value"))
        )
    # smaz vsechny udaje
    name_field.clear()
    duration_field.clear()
    color_field.clear()  # tohle kvuli vnitrni implementaci color pickeru nic nedela (resp. to tam da default hodnotu)
    # vloz nove udaje
    if (context.visible and not visible_checkbox.is_selected()) or (
        not context.visible and visible_checkbox.is_selected()
    ):
        visible_label.click()
    name_field.send_keys(context.name)
    duration_field.send_keys(context.duration)
    # klikni na label color pickeru aby se oznacil cela hodnota inputu a nasledne ji preplacni tou novou hodnotou,
    # bylo by fajn to delat klasicky pres clear a send_keys, ale bohuzel si to se seleniem a default hodnotou z knihovny color pickeru nerozumi
    color_label.click()
    color_field.send_keys(context.color)
    print(color_field.get_attribute("value"))


def load_data_to_context(context, name, visible, duration, color):
    load_id_data_to_context(context, name)
    context.visible = common_helpers.to_bool(visible)
    context.duration = duration
    context.color = color


def load_id_data_to_context(context, name):
    context.name = name


def save_old_courses_cnt_to_context(context):
    context.old_courses_cnt = courses_cnt(context.browser)


@then("the course is added")
def step_impl(context):
    # pockej az bude modalni okno kompletne zavrene
    helpers.wait_modal_closed(context.browser)
    # pockej na pridani kurzu
    WebDriverWait(context.browser, helpers.WAIT_TIME).until(
        lambda driver: find_course_with_context(context)
    )
    # over, ze sedi pocet kurzu
    assert courses_cnt(context.browser) > context.old_courses_cnt


@then("the course is updated")
def step_impl(context):
    # pockej az bude modalni okno kompletne zavrene
    helpers.wait_modal_closed(context.browser)
    # pockej na update kurzu
    WebDriverWait(context.browser, helpers.WAIT_TIME).until(
        lambda driver: find_course_with_context(context)
    )
    # over, ze sedi pocet kurzu
    assert courses_cnt(context.browser) == context.old_courses_cnt


@then("the course is deleted")
def step_impl(context):
    # pockej az bude modalni okno kompletne zavrene
    helpers.wait_modal_closed(context.browser)
    # pockej na smazani kurzu (zmensi se pocet), nesahame zatim na data, mohla by byt nestabilni kvuli mazani
    WebDriverWait(context.browser, helpers.WAIT_TIME).until(
        lambda driver: courses_cnt(driver) < context.old_courses_cnt
    )
    # over, ze kurz opravdu neni nalezen
    assert not find_course(context, context.name)


@when('user deletes the course "{name}"')
def step_impl(context, name):
    # nacti jmeno kurzu do kontextu
    load_id_data_to_context(context, name)
    # klikni v menu na nastaveni
    helpers.open_settings(context.browser)
    # pockej na nacteni
    helpers.wait_loading_ends(context.browser)
    # najdi kurz a klikni u nej na Upravit
    course_to_update = find_course(context, context.name)
    assert course_to_update
    button_edit_course = course_to_update.find_element(
        By.CSS_SELECTOR, "[data-qa=button_edit_course]"
    )
    button_edit_course.click()
    # uloz puvodni pocet kurzu
    save_old_courses_cnt_to_context(context)
    # pockej az bude viditelny formular
    helpers.wait_form_settings_visible(context.browser)
    # klikni na smazat
    button_delete_course = context.browser.find_element(
        By.CSS_SELECTOR, "[data-qa=settings_button_delete]"
    )
    button_delete_course.click()
    # a potvrd smazani
    helpers.wait_for_alert_and_accept(context.browser)


@then("the course is not added")
def step_impl(context):
    # zjisti, zda stale sviti formular a zadny kurz nepribyl
    try:
        WebDriverWait(context.browser, helpers.WAIT_TIME_SHORT).until_not(
            EC.presence_of_element_located((By.CSS_SELECTOR, "[data-qa=form_settings]"))
        )
        form_course_visible = False
    except TimeoutException:
        form_course_visible = True
    assert form_course_visible
    assert courses_cnt(context.browser) == context.old_courses_cnt


@when(
    'user updates the data of course "{cur_name}" to name "{new_name}", visibility "{new_visible}", duration "{new_duration}" and color "{new_color}"'
)
def step_impl(context, cur_name, new_name, new_visible, new_duration, new_color):
    # nacti data kurzu do kontextu
    load_data_to_context(context, new_name, new_visible, new_duration, new_color)
    # klikni v menu na nastaveni
    helpers.open_settings(context.browser)
    # pockej na nacteni
    helpers.wait_loading_ends(context.browser)
    # najdi kurz a klikni u nej na Upravit
    course_to_update = find_course(context, cur_name)
    assert course_to_update
    button_edit_course = course_to_update.find_element(
        By.CSS_SELECTOR, "[data-qa=button_edit_course]"
    )
    button_edit_course.click()
    # uloz puvodni pocet kurzu
    save_old_courses_cnt_to_context(context)
    # over spravne zobrazene udaje ve formulari a vloz do nej vsechny udaje
    insert_to_form(context, True)
    # odesli formular
    helpers.submit_form(context, "button_submit_settings")


use_step_matcher("re")


@when(
    'user adds new course "(?P<name>.*)" with visibility "(?P<visible>.*)", duration "(?P<duration>.*)" and color "(?P<color>.*)"'
)
def step_impl(context, name, visible, duration, color):
    # nacteni dat kurzu do kontextu
    load_data_to_context(context, name, visible, duration, color)
    # klikni v menu na nastaveni
    helpers.open_settings(context.browser)
    # pockej na nacteni a pak klikni na Pridat kurz
    helpers.wait_loading_ends(context.browser)
    button_add_course = context.browser.find_element(By.CSS_SELECTOR, "[data-qa=button_add_course]")
    button_add_course.click()
    # uloz puvodni pocet kurzu
    save_old_courses_cnt_to_context(context)
    # vloz vsechny udaje do formulare
    insert_to_form(context)
    # odesli formular
    helpers.submit_form(context, "button_submit_settings")
