from selenium import webdriver
from tests import helpers

SCREEN_WIDTH = 1920


def before_all(context):
    context.browser = webdriver.Firefox()
    window_width = context.browser.get_window_size()['width']
    # pozice okna vpravo nahore
    context.browser.set_window_position(SCREEN_WIDTH - window_width, 0)
    # automaticka minimalizace okna
    context.browser.minimize_window()


def after_all(context):
    context.browser.quit()


def before_scenario(context, scenario):
    context.user = helpers.add_user()
