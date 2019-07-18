from selenium import webdriver
from selenium.webdriver.firefox.options import Options

from tests import fixtures

SCREEN_WIDTH = 1920
SCREEN_HEIGHT = 1080


def before_all(context):
    options = Options()
    options.headless = True
    context.browser = webdriver.Firefox(options=options)
    context.browser.set_window_size(SCREEN_WIDTH, SCREEN_HEIGHT)


def after_all(context):
    context.browser.quit()


def before_scenario(context, scenario):
    context.user = fixtures.user()


def after_scenario(context, step):
    # odhlaseni - je potreba, jinak testy obcas neprojdou
    context.browser.execute_script("window.localStorage.clear();")
