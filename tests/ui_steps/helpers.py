from selenium.common.exceptions import TimeoutException, NoSuchElementException
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

from tests import common_helpers

WAIT_TIME = 10
WAIT_TIME_SHORT = 3


def wait_loading_cycle(driver):
    # pockej na loading, pokud se ukaze, pockej, az skonci
    try:
        WebDriverWait(driver, WAIT_TIME).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, '[data-qa=loading]')))
    except TimeoutException:
        pass
    else:
        wait_loading_ends(driver)


def submit_form(context, button_name):
    # klikni na tlacitko s danym data-qa atributem
    # - klasicke element.submit() se nepouziva proto, ze netestuje typicke chovani uzivatele - kliknuti na tlacitko
    #   ulozeni, ale odeslani Enterem, tedy napr. pokud by bylo tlacitko disabled, testy projdou, ale uzivateli to nejde
    button = context.browser.find_element_by_css_selector(f'[data-qa={button_name}]')
    button.click()


def check_fa_bool(visible, classes):
    # sedi hodnota visible se zobrazenou FontAwesome ikonou?
    classes_list = classes.split()
    if ((visible and 'fa-check' in classes_list) or
            (not visible and 'fa-times' in classes_list)):
        return True
    return False


def check_class_included(classes, class_to_search):
    classes_list = classes.split()
    return class_to_search in classes_list


def wait_form_settings_visible(driver):
    WebDriverWait(driver, WAIT_TIME).until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-qa=form_settings]')))


def wait_loading_ends(driver):
    WebDriverWait(driver, WAIT_TIME).until_not(
        EC.presence_of_element_located((By.CSS_SELECTOR, '[data-qa=loading]')))


def frontend_empty_str(text):
    return "---" if text == "" else text


def wait_for_alert_and_accept(driver):
    WebDriverWait(driver, WAIT_TIME_SHORT).until(EC.alert_is_present())
    driver.switch_to.alert.accept()


def react_select_insert(driver, element, value):
    # vlozi prvek do react-selectu pokud je nalezen v nabidce react-selectu
    element.send_keys(value)
    try:
        # najdi moznosti react-selectu, moznosti maji id zacinajici danym stringem
        found_option = driver.find_element_by_css_selector("[id^='react-select-']")
    except NoSuchElementException:
        pass
    else:
        found_option.click()
    # zavri react-select kliknutim na dropdown ikonu (jinak muze prekryvat jine elementy)
    driver.find_element_by_css_selector(f".{element.get_attribute('id')}__indicators").click()


def open_settings(driver):
    driver.find_element_by_css_selector('[data-qa=menu_settings]').click()


def open_groups(driver):
    driver.find_element_by_css_selector('[data-qa=menu_groups]').click()


def open_clients(driver):
    driver.find_element_by_css_selector('[data-qa=menu_clients]').click()


def toggle_switcher_active(driver, active):
    button_str = 'button_switcher_active' if active else 'button_switcher_inactive'
    driver.find_element_by_css_selector(f'[data-qa={button_str}]').click()


def get_clients(driver, active):
    toggle_switcher_active(driver, active)
    # pockej na nacteni
    wait_loading_ends(driver)
    return driver.find_elements_by_css_selector('[data-qa=client]')


def get_groups(driver, active):
    toggle_switcher_active(driver, active)
    # pockej na nacteni
    wait_loading_ends(driver)
    return driver.find_elements_by_css_selector('[data-qa=group]')


def close_modal(driver):
    driver.find_element_by_class_name('close').click()


def wait_switching_available(driver, form_name):
    WebDriverWait(driver, WAIT_TIME_SHORT).until_not(
        EC.visibility_of_element_located((By.CSS_SELECTOR, f'[data-qa={form_name}]')))
    try:
        notification = WebDriverWait(driver, WAIT_TIME_SHORT).until(
            EC.element_to_be_clickable((By.CLASS_NAME, 'Toastify__close-button')))
        notification.click()
    except TimeoutException:
        pass


def _find_group_with_activity(activity, context, name, open_card=False, validate_context=False):
    # nacti skupiny s prislusnou ne/aktivitou
    groups = get_groups(context.browser, activity)
    # najdi skupinu s udaji v parametrech
    for group in groups:
        found_name_element = group.find_element_by_css_selector('[data-qa=group_name]')
        found_name = found_name_element.text
        found_group = None
        # srovnej identifikatory
        if found_name == name:
            # identifikatory sedi, otestuj pripadna dalsi zaslana data nebo rovnou vrat nalezeny prvek
            if validate_context:
                found_course = group.find_element_by_css_selector('[data-qa=course_name]').text
                found_memberships_elements = group.find_elements_by_css_selector('[data-qa=client_name]')
                found_memberships = [element.text for element in found_memberships_elements]
                if (set(found_memberships) == set(context.memberships) and
                        found_course == context.course and
                        activity == context.active):
                    found_group = group
            else:
                found_group = group
        if found_group:
            if open_card:
                found_name_element.click()
            return found_group
    return None


def find_group(context, name, open_card=False, validate_context=False):
    active_group = _find_group_with_activity(True, context, name, open_card, validate_context)
    if active_group:
        return active_group
    inactive_group = _find_group_with_activity(False, context, name, open_card, validate_context)
    if inactive_group:
        return inactive_group
    return None


def _find_client_with_activity(activity, context, full_name, open_card, **data):
    # nacti klienty s prislusnou ne/aktivitou
    clients = get_clients(context.browser, activity)
    # najdi klienta s udaji v parametrech
    for client in clients:
        found_name_element = client.find_element_by_css_selector('[data-qa=client_name]')
        found_name = found_name_element.text
        found_client = None
        # srovnej identifikatory
        if found_name == full_name:
            # identifikatory sedi, otestuj pripadna dalsi zaslana data nebo rovnou vrat nalezeny prvek
            if data:
                found_phone = client.find_element_by_css_selector('[data-qa=client_phone]').text
                found_email = client.find_element_by_css_selector('[data-qa=client_email]').text
                found_note = client.find_element_by_css_selector('[data-qa=client_note]').text
                if (common_helpers.shrink_str(found_phone) == frontend_empty_str(
                        common_helpers.shrink_str(data['phone'])) and
                        found_email == frontend_empty_str(data['email']) and
                        found_note == frontend_empty_str(data['note']) and
                        activity == data['active']):
                    found_client = client
            else:
                found_client = client
        if found_client:
            if open_card:
                found_name_element.click()
            return found_client
    return None


def find_client(context, full_name, open_card=False, **data):
    active_client = _find_client_with_activity(True, context, full_name, open_card, **data)
    if active_client:
        return active_client
    inactive_client = _find_client_with_activity(False, context, full_name, open_card, **data)
    if inactive_client:
        return inactive_client
    return None
