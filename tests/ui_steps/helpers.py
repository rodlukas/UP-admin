from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.common.exceptions import TimeoutException

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


def wait_loading_ends(driver):
    WebDriverWait(driver, WAIT_TIME).until_not(
        EC.presence_of_element_located((By.CSS_SELECTOR, '[data-qa=loading]')))


def frontend_empty_str(text):
    return "---" if text == "" else text


def wait_for_alert_and_accept(driver):
    WebDriverWait(driver, WAIT_TIME_SHORT).until(EC.alert_is_present())
    driver.switch_to.alert.accept()
