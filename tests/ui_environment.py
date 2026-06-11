from django.conf import settings
from selenium import webdriver
from selenium.webdriver.chrome.options import Options as ChromeOptions
from selenium.webdriver.firefox.options import Options as FirefoxOptions

from tests import fixtures

SCREEN_WIDTH = 1920
SCREEN_HEIGHT = 1080


def before_all(context):
    browser_name = settings.TESTS_BROWSER.lower()
    headless = settings.TESTS_HEADLESS

    if browser_name == "chrome":
        options = ChromeOptions()
        if headless:
            options.add_argument("--headless=new")
        context.browser = webdriver.Chrome(options=options)
    else:
        options = FirefoxOptions()
        if headless:
            options.add_argument("--headless")
        context.browser = webdriver.Firefox(options=options)

    context.browser.set_window_size(SCREEN_WIDTH, SCREEN_HEIGHT)


def after_all(context):
    context.browser.quit()


def before_scenario(context, scenario):
    context.user = fixtures.user()


def after_scenario(context, scenario):
    # odhlaseni - je potreba, jinak testy obcas neprojdou
    context.browser.execute_script("window.localStorage.clear();")
    # reload resetuje SPA (in-memory TanStack Query cache) - kazdy scenar bezi
    # ve vlastni DB transakci s novymi radky/ID, stale nacachovana data z minuleho
    # scenare by vedla na requesty s neexistujicimi ID (napr. PUT pri editaci)
    context.browser.refresh()
