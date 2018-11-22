from selenium import webdriver
from rest_framework.test import APIClient


def before_all(context):
    context.client = APIClient()
    context.browser = webdriver.Firefox()


def after_all(context):
    context.browser.quit()


def before_feature(context, feature):
    # Code to be executed each time a feature is going to be tested
    pass
