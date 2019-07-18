from behave import *
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

from tests import common_helpers
from tests.common_steps import groups
from tests.ui_steps import helpers
from tests.ui_steps import login_logout


def groups_cnt(driver):
    return len(helpers.get_groups(driver, True) + helpers.get_groups(driver, False))


def find_group_with_context(context):
    return helpers.find_group(context, context.name, validate_context=True)


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
    active_checkbox = context.browser.find_element_by_css_selector('[data-qa=group_checkbox_active]')
    active_label = context.browser.find_element_by_css_selector('[data-qa=group_label_active]')
    # smaz vsechny udaje
    name_field.clear()
    course_field.send_keys(Keys.BACK_SPACE)
    # v testech jsou max 2 clenove - odstran je
    memberships_field.send_keys(Keys.BACK_SPACE)
    memberships_field.send_keys(Keys.BACK_SPACE)
    # vloz nove udaje
    name_field.send_keys(context.name)
    helpers.react_select_insert(context.browser, course_field, context.course)
    for membership in context.memberships:
        if not helpers.react_select_insert(context.browser, memberships_field, membership):
            context.react_select_success = False
    if ((context.active and not active_checkbox.is_selected()) or
            (not context.active and active_checkbox.is_selected())):
        active_label.click()
    # vrat posledni element
    return memberships_field


def load_data_to_context(context, name, course, active, *memberships):
    load_id_data_to_context(context, name)
    context.course = course
    context.active = common_helpers.to_bool(active)
    # z memberships vyfiltruj prazdne stringy
    context.memberships = common_helpers.filter_empty_strings_from_list(memberships)
    # pro indikaci neuspesneho zadani clenu do react-selectu (clen nebyl ve vyberu)
    context.react_select_success = True


def load_id_data_to_context(context, name):
    context.name = name


def wait_switching_available(driver):
    helpers.wait_switching_available(driver, "form_group")


def save_old_groups_cnt_to_context(context):
    context.old_groups_cnt = groups_cnt(context.browser)


@then('the group is added')
def step_impl(context):
    # pockej az bude mozne prepinat mezi ne/aktivnimi skupinami
    wait_switching_available(context.browser)
    # pockej na pridani skupiny
    WebDriverWait(context.browser, helpers.WAIT_TIME).until(
        lambda driver: groups_cnt(driver) > context.old_groups_cnt)
    # je skupina opravdu pridana?
    assert find_group_with_context(context)


@then('the group is updated')
def step_impl(context):
    # pockej az bude mozne prepinat mezi ne/aktivnimi skupinami
    wait_switching_available(context.browser)
    # pockej na update skupin
    helpers.wait_loading_cycle(context.browser)
    # ma skupina opravdu nove udaje?
    assert find_group_with_context(context)
    assert groups_cnt(context.browser) == context.old_groups_cnt


@then('the group is deleted')
def step_impl(context):
    # pockej az bude mozne prepinat mezi ne/aktivnimi skupinami
    wait_switching_available(context.browser)
    # pockej na smazani skupiny
    WebDriverWait(context.browser, helpers.WAIT_TIME).until(
        lambda driver: groups_cnt(driver) < context.old_groups_cnt)
    # je skupina opravdu smazana?
    assert not helpers.find_group(context, context.name)


@when('user deletes the group "{name}"')
def step_impl(context, name):
    # nacti jmeno skupiny do kontextu
    load_id_data_to_context(context, name)
    # klikni v menu na skupiny
    helpers.open_groups(context.browser)
    # pockej na nacteni
    helpers.wait_loading_ends(context.browser)
    # uloz puvodni pocet skupin
    save_old_groups_cnt_to_context(context)
    # najdi skupinu a klikni u ni na Upravit
    group_to_update = helpers.find_group(context, context.name)
    assert group_to_update
    button_edit_group = group_to_update.find_element_by_css_selector('[data-qa=button_edit_group]')
    button_edit_group.click()
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
    # pokud nedoslo k problemu pri zadavani clenu do react-selectu, vse prover
    # pokud k problemu doslo, lekce se pridala, ale to neni chyba - prida se bez neexistujicich clenu
    if context.react_select_success:
        assert form_group_visible
        # zavri formular
        helpers.close_modal(context.browser)
        # pockej az bude mozne prepinat mezi ne/aktivnimi klienty
        wait_switching_available(context.browser)
        assert groups_cnt(context.browser) == context.old_groups_cnt


@when(
    'user updates the data of group "{cur_name}" to name "{new_name}", course "{new_course}", activity "{new_active}" and clients to "{new_member_full_name1}", "{new_member_full_name2}" and "{new_member_full_name3}"')
def step_impl(context, cur_name, new_name, new_course, new_active, new_member_full_name1, new_member_full_name2,
              new_member_full_name3):
    # nacti data skupiny do kontextu
    load_data_to_context(context, new_name, new_course, new_active, new_member_full_name1, new_member_full_name2,
                         new_member_full_name3)
    # klikni v menu na skupiny
    helpers.open_groups(context.browser)
    # pockej na nacteni
    helpers.wait_loading_ends(context.browser)
    # uloz puvodni pocet skupin
    save_old_groups_cnt_to_context(context)
    # najdi skupinu a klikni u ni na Upravit
    group_to_update = helpers.find_group(context, cur_name)
    assert group_to_update
    button_edit_group = group_to_update.find_element_by_css_selector('[data-qa=button_edit_group]')
    button_edit_group.click()
    # vloz vsechny udaje do formulare
    last_field = insert_to_form(context)
    # odesli formular
    last_field.submit()


use_step_matcher("re")


@when(
    'user adds new group "(?P<name>.*)" for course "(?P<course>.*)" with activity "(?P<active>.*)" and clients "(?P<member_full_name1>.*)" and "(?P<member_full_name2>.*)"')
def step_impl(context, name, course, active, member_full_name1, member_full_name2):
    # nacti data skupiny do kontextu
    load_data_to_context(context, name, course, active, member_full_name1, member_full_name2)
    # klikni v menu na skupiny
    helpers.open_groups(context.browser)
    # pockej na nacteni
    helpers.wait_loading_ends(context.browser)
    # uloz puvodni pocet skupin
    save_old_groups_cnt_to_context(context)
    # klikni na Pridat skupinu
    button_add_group = context.browser.find_element_by_css_selector('[data-qa=button_add_group]')
    button_add_group.click()
    # vloz vsechny udaje do formulare
    last_field = insert_to_form(context)
    # odesli formular
    last_field.submit()
