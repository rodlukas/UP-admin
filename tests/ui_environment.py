import os

from django.conf import settings
from selenium import webdriver
from selenium.webdriver.chrome.options import Options as ChromeOptions
from selenium.webdriver.firefox.options import Options as FirefoxOptions

from tests import fixtures
from tests.bank_override import assert_no_real_request, block_real_bank

SCREEN_WIDTH = 1920
SCREEN_HEIGHT = 1080


def before_all(context):
    block_real_bank(context)
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
        # bez techto prepinacu Chrome na macOS saha do systemove Klicenky; Playwright
        # a Puppeteer je pridavaji sami, Selenium ne
        options.add_argument("--use-mock-keychain")
        options.add_argument("--password-store=basic")
        # volitelne: konkretni uz stazeny Chromium binary (napr. od Playwright) misto Chrome
        # for Testing stazeneho Selenium Managerem. Nastavuje se i v attach rezimu nize
        # (binary se samo nespusti), protoze podle nej Selenium Manager pozna, jakou verzi
        # chromedriveru si ma stahnout.
        chrome_binary = os.environ.get("TESTS_CHROME_BINARY")
        if chrome_binary:
            options.binary_location = chrome_binary
        # volitelne: pripoj se na uz bezici Chromium pres CDP misto spousteni vlastniho
        # prohlizece (prepinace vyse pak urcuje ten, kdo prohlizec spustil)
        debugger_address = os.environ.get("TESTS_CHROME_DEBUGGER_ADDRESS")
        if debugger_address:
            options.add_experimental_option("debuggerAddress", debugger_address)
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
    assert_no_real_request(context)


def before_scenario(context, scenario):
    # scenare overujici jen data API (bez UI pruchodu) v UI stage nemaji kroky a preskakuji se
    if "api_only" in scenario.effective_tags:
        scenario.skip(reason="scenar je urceny jen pro API stage (--stage=api)")
        return
    context.user = fixtures.user()


def after_step(context, step):
    # CI z padleho UI kroku jinak ukaze jen TimeoutException bez obsahu stranky - vypis, kde
    # prohlizec byl a co na strance videl (behave vystup kroku zobrazi u chyby)
    if step.status.name not in ("failed", "error"):
        return
    try:
        url = context.browser.current_url
        text = context.browser.execute_script("return document.body ? document.body.innerText : ''")
    except Exception as err:  # prohlizec muze byt v nestandardnim stavu (alert, padly)
        print(f"[ui-debug] stav prohlizece nelze precist: {err!r}")
        return
    print(f"[ui-debug] url: {url}")
    print(f"[ui-debug] text stranky:\n{text[:2000]}")


def after_scenario(context, scenario):
    # scenar byl preskocen (viz before_scenario) - prohlizec nikdy neopustil "about:blank",
    # kde je localStorage nedostupny (SecurityError) a odhlaseni tedy nema smysl
    if "api_only" in scenario.effective_tags:
        return
    # odhlaseni - je potreba, jinak testy obcas neprojdou
    context.browser.execute_script("window.localStorage.clear();")
    # Odnaviguj z aplikace pryc. Po kazde uspesne mutaci invaliduje `mutationCache.onSuccess`
    # (queryClient.tsx) vsechny queries, takze scenar konci davkou refetchu - a `retry: 1`
    # jim navic da druhy pokus. Kdyby stranka zustala namountovana, tyhle requesty by dobehly
    # az do live serveru, ktery uz behave-django boura, a teardown by spadl na
    # "database couldn't be flushed". Prazdna stranka je proti reloadu aplikace zlomkovy
    # naklad a SPA (i s in-memory cache TanStack Query) resetuje stejne dobre - dalsi scenar
    # si ji nacte znovu prihlasenim pres `browser.get(base_url)`.
    context.browser.get("about:blank")
