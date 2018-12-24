from selenium import webdriver
from tests import helpers


def before_all(context):
    context.browser = webdriver.Firefox()


def after_all(context):
    context.browser.quit()


def before_scenario(context, scenario):
    context.user = helpers.add_user()
