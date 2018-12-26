from selenium import webdriver
from tests import fixtures
from selenium.webdriver.firefox.options import Options


def before_all(context):
    options = Options()
    options.headless = False
    context.browser = webdriver.Firefox(options=options)
    context.browser.set_window_size(1920, 1080)


def after_all(context):
    context.browser.quit()


def before_scenario(context, scenario):
    context.user = fixtures.user()
