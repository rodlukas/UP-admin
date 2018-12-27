from behave import *
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.common.exceptions import TimeoutException
from tests.ui_steps import helpers
from tests import common_helpers
from selenium.webdriver.common.keys import Keys
from tests.common_steps import groups
from tests.ui_steps import login_logout


def get_groups(driver):
    return driver.find_elements_by_css_selector('[data-qa=group]')


def groups_cnt(driver):
    return len(get_groups(driver))


def open_groups(driver):
    driver.find_element_by_css_selector('[data-qa=menu_groups]').click()


def find_group(driver, name, **data):
    all_groups = get_groups(driver)
    # najdi skupinu s udaji v parametrech
    for group in all_groups:
        found_name = group.find_element_by_css_selector('[data-qa=group_name]').text
        # srovnej identifikatory
        if found_name == name:
            # identifikatory sedi, otestuj pripadna dalsi zaslana data nebo rovnou vrat nalezeny prvek
            if data:
                found_course = group.find_element_by_css_selector('[data-qa=course_name]').text
                found_memberships_elements = group.find_elements_by_css_selector('[data-qa=client_name]')
                found_memberships = [element.text for element in found_memberships_elements]
                if (set(found_memberships) == set(data['memberships']) and
                        found_course == data['course']):
                    return group
            else:
                return group
    return False


def find_group_with_context(context):
    return find_group(context.browser, context.name, course=context.course, memberships=context.memberships)


def wait_form_visible(driver):
    WebDriverWait(driver, helpers.WAIT_TIME).until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-qa=form_group]')))


def insert_to_form(context):
    # pockej az bude viditelny formular
    wait_form_visible(context.browser)
    # vloz vsechny udaje do formulare
    name_field = context.browser.find_element_by_css_selector('[data-qa=group_field_name]')
    course_field = context.browser.find_element_by_id('course')
    memberships_field = context.browser.find_element_by_id('memberships')
    # smaz vsechny udaje
    name_field.clear()
    course_field.send_keys(Keys.BACK_SPACE)
    memberships_field.send_keys(Keys.BACK_SPACE)
    # vloz nove udaje
    name_field.send_keys(context.name)
    course_field.send_keys(context.course, Keys.ENTER)
    for membership in context.memberships:
        memberships_field.send_keys(membership, Keys.ENTER)
    # vrat posledni element
    return memberships_field


def load_data_to_context(context, name, course, *memberships):
    load_id_data_to_context(context, name)
    context.course = course
    # z memberships vyfiltruj prazdne stringy
    context.memberships = common_helpers.filter_empty_strings_from_list(memberships)


def load_id_data_to_context(context, name):
    context.name = name


def save_old_groups_cnt_to_context(context):
    context.old_groups_cnt = groups_cnt(context.browser)


@then('the group is added')
def step_impl(context):
    # pockej na pridani skupiny
    WebDriverWait(context.browser, helpers.WAIT_TIME).until(
        lambda driver: groups_cnt(driver) > context.old_groups_cnt)
    # je skupina opravdu pridana?
    assert find_group_with_context(context)


@then('the group is updated')
def step_impl(context):
    # pockej na update skupin
    helpers.wait_loading_cycle(context.browser)
    # ma skupina opravdu nove udaje?
    assert find_group_with_context(context)
    assert groups_cnt(context.browser) == context.old_groups_cnt


@then('the group is deleted')
def step_impl(context):
    # pockej na smazani skupiny
    WebDriverWait(context.browser, helpers.WAIT_TIME).until(
        lambda driver: groups_cnt(driver) < context.old_groups_cnt)
    # je skupina opravdu smazana?
    assert not find_group(context.browser, context.name)


@when('user deletes the group "{name}"')
def step_impl(context, name):
    # nacti jmeno skupiny do kontextu
    load_id_data_to_context(context, name)
    # klikni v menu na skupiny
    open_groups(context.browser)
    # pockej na nacteni
    helpers.wait_loading_ends(context.browser)
    # najdi skupinu a klikni u ni na Upravit
    group_to_update = find_group(context.browser, context.name)
    assert group_to_update
    button_edit_group = group_to_update.find_element_by_css_selector('[data-qa=button_edit_group]')
    button_edit_group.click()
    # uloz puvodni pocet skupin
    save_old_groups_cnt_to_context(context)
    # pockej az bude viditelny formular
    wait_form_visible(context.browser)
    # klikni na smazat
    button_delete_group = context.browser.find_element_by_css_selector('[data-qa=button_delete_group]')
    button_delete_group.click()
    # a potvrd smazani
    helpers.wait_for_alert_and_accept(context.browser)


@then('the group is not added')
def step_impl(context):
    # zjisti, zda se objevi alert (skupina se nepridala)
    try:
        helpers.wait_for_alert_and_accept(context.browser)
    except TimeoutException:
        # alert se neobjevil, zmizel formular?
        try:
            WebDriverWait(context.browser, helpers.WAIT_TIME_SHORT).until_not(
                EC.presence_of_element_located((By.CSS_SELECTOR, '[data-qa=form_group]')))
        except TimeoutException:
            # formular nezmizel
            form_group_visible = True
        else:
            # formular zmizel
            form_group_visible = False
    else:
        # alert se objevil, takze formular je stale videt
        form_group_visible = True
    assert form_group_visible
    assert groups_cnt(context.browser) == context.old_groups_cnt


@when(
    'user updates the data of group "{cur_name}" to name "{new_name}", course "{new_course}" and clients to "{new_member_full_name1}", "{new_member_full_name2}" and "{new_member_full_name3}"')
def step_impl(context, cur_name, new_name, new_course, new_member_full_name1, new_member_full_name2,
              new_member_full_name3):
    # nacti data skupiny do kontextu
    load_data_to_context(context, new_name, new_course, new_member_full_name1, new_member_full_name2,
                         new_member_full_name3)
    # klikni v menu na skupiny
    open_groups(context.browser)
    # pockej na nacteni
    helpers.wait_loading_ends(context.browser)
    # najdi skupinu a klikni u ni na Upravit
    group_to_update = find_group(context.browser, cur_name)
    assert group_to_update
    button_edit_group = group_to_update.find_element_by_css_selector('[data-qa=button_edit_group]')
    button_edit_group.click()
    # uloz puvodni pocet skupin
    save_old_groups_cnt_to_context(context)
    # vloz vsechny udaje do formulare
    last_field = insert_to_form(context)
    # odesli formular
    last_field.submit()


use_step_matcher("re")


@when(
    'user adds new group "(?P<name>.*)" for course "(?P<course>.*)" with clients "(?P<member_full_name1>.*)" and "(?P<member_full_name2>.*)"')
def step_impl(context, name, course, member_full_name1, member_full_name2):
    # nacti data skupiny do kontextu
    load_data_to_context(context, name, course, member_full_name1, member_full_name2)
    # klikni v menu na skupiny
    open_groups(context.browser)
    # pockej na nacteni a pak klikni na Pridat skupinu
    helpers.wait_loading_ends(context.browser)
    button_add_group = context.browser.find_element_by_css_selector('[data-qa=button_add_group]')
    button_add_group.click()
    # uloz puvodni pocet skupin
    save_old_groups_cnt_to_context(context)
    # vloz vsechny udaje do formulare
    last_field = insert_to_form(context)
    # odesli formular
    last_field.submit()
