from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.common.exceptions import TimeoutException, NoSuchElementException

WAIT_TIME = 10
WAIT_TIME_SHORT = 3


def wait_loading_cycle(driver):
    # pockej na loading, pokud se ukaze, pockej az skonci
    try:
        WebDriverWait(driver, WAIT_TIME).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, '[data-qa=loading]')))
    except TimeoutException:
        pass
    else:
        wait_loading_ends(driver)


def check_fa_bool(visible, classes):
    # sedi hodnota visible se zobrazenou FontAwesome ikonou?
    classes_list = classes.split()
    if ((visible and 'fa-check' in classes_list) or
            (not visible and 'fa-times' in classes_list)):
        return True
    return False


def wait_form_settings_visible(driver):
    WebDriverWait(driver, WAIT_TIME).until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-qa=form_settings]')))


def open_settings(driver):
    driver.find_element_by_css_selector('[data-qa=menu_settings]').click()


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
        found_option = driver.find_element_by_xpath("//*[@role='option']")
    except NoSuchElementException:
        pass
    else:
        found_option.click()
