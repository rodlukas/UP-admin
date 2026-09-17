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

    # prefers-reduced-motion vynucujeme explicitne: holy CI Linux runner (bez desktopu)
    # ho hlasi sam od sebe, lokalni macOS ne - bez pripnuti se chovani UI s
    # respectReducedMotion (theme.ts) lisi mezi lokalem a CI ("u me to prochazi");
    # vypnute animace jsou navic pro Selenium deterministictejsi
    if browser_name == "chrome":
        options = ChromeOptions()
        if headless:
            options.add_argument("--headless=new")
        options.add_argument("--force-prefers-reduced-motion")
        context.browser = webdriver.Chrome(options=options)
    else:
        options = FirefoxOptions()
        if headless:
            options.add_argument("--headless")
        options.set_preference("ui.prefersReducedMotion", 1)
        context.browser = webdriver.Firefox(options=options)

    context.browser.set_window_size(SCREEN_WIDTH, SCREEN_HEIGHT)


def after_all(context):
    context.browser.quit()


def before_scenario(context, scenario):
    context.user = fixtures.user()


def after_scenario(context, scenario):
    # Odhlaseni - je potreba, jinak testy obcas neprojdou. Reload stranky uz ne: SPA
    # (a s ni in-memory cache TanStack Query) resetuje prvni krok dalsiho scenare,
    # prihlaseni pres `browser.get(base_url)`, coz je plna navigace. Data z minuleho
    # scenare, jejichz ID uz po rollbacku transakce neexistuji, tim padnou i tak.
    context.browser.execute_script("window.localStorage.clear();")
