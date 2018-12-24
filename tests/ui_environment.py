from selenium import webdriver
from tests import helpers
import os

SCREEN_WIDTH = 1920


def before_all(context):
    context.browser = webdriver.Firefox()
    # pokud jsem v GUI rezimu, uprav vlastnosti okna
    if os.environ.get('MOZ_HEADLESS', 0) == 1:
        window_width = context.browser.get_window_size()['width']
        # pozice okna vpravo nahore
        context.browser.set_window_position(SCREEN_WIDTH - window_width, 0)
        # automaticka minimalizace okna
        context.browser.minimize_window()


def after_all(context):
    context.browser.quit()


def before_scenario(context, scenario):
    context.user = helpers.add_user()
