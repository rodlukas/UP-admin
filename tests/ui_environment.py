import os

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
        # macOS: bez techto dvou prepinacu sahá headless Chrome se vzdálenym debug portem
        # (coz je presne to, co pouziva Selenium) do systemove Klicenky (polozka "Chrome
        # Safe Storage") - bezpecnostni dohled na pracovnim Macu to vyhodnoti jako krádez
        # hesel. Playwright/Puppeteer/chrome-launcher je pridavaji sami, Selenium ne.
        options.add_argument("--use-mock-keychain")
        options.add_argument("--password-store=basic")
        # volitelne: konkretni uz stazeny Chromium binary (napr. od Playwright) misto Chrome
        # for Testing stazeneho Selenium Managerem. Nastavuje se i v attach rezimu nize
        # (binary se samo nespusti), protoze podle nej Selenium Manager pozna, jakou verzi
        # chromedriveru si ma stahnout.
        chrome_binary = os.environ.get("TESTS_CHROME_BINARY")
        if chrome_binary:
            options.binary_location = chrome_binary
        # volitelne: pripoj se na uz bezici Chromium pres CDP (napr. spustene primo
        # Playwrightem) misto spousteni vlastniho prohlizece - hodi se v prostredich, kde
        # Selenium samo spoustet prohlizec nesmi, ale pripojit se na uz bezici proces ano
        debugger_address = os.environ.get("TESTS_CHROME_DEBUGGER_ADDRESS")
        if debugger_address:
            options.add_experimental_option("debuggerAddress", debugger_address)
        context.browser = webdriver.Chrome(options=options)
    else:
        options = FirefoxOptions()
        if headless:
            options.add_argument("--headless")
        options.set_preference("ui.prefersReducedMotion", 1)
        # Pokud bezici "skutecny" Firefox na tomhle Macu ma stazenou/pripravenou
        # aktualizaci ke staazeni ("staged"), kazde DALSI spusteni Firefoxu (i tohle,
        # samostatny automatizacni profil) se ji pokusi dokoncit - prepsat
        # /Applications/Firefox.app, coz vyzaduje admin opravneni a bez nikoho, kdo by
        # dialog potvrdil, to visi donekonecna (geckodriver pak hlasi "Failed to read
        # marionette port", protoze Firefox misto spusteni ceka na update). Vypnuti
        # automatickych aktualizaci v tomhle profilu snizuje riziko, ze se cokoliv
        # nestaguje skrz TUHLE instanci - jiz jednou stagovanou aktualizaci z beziciho
        # "skutecneho" Firefoxu to ale neresi (viz tests/README.md).
        options.set_preference("app.update.auto", False)
        options.set_preference("app.update.staging.enabled", False)
        options.set_preference("app.update.service.enabled", False)
        context.browser = webdriver.Firefox(options=options)

    context.browser.set_window_size(SCREEN_WIDTH, SCREEN_HEIGHT)


def after_all(context):
    context.browser.quit()


def before_scenario(context, scenario):
    # scenare, ktere jdou overit jen pres API (anonymni pozadavek, projeveni zmen clenu),
    # v UI stage nemaji kroky a preskakuji se
    if "api_only" in scenario.effective_tags:
        scenario.skip(reason="scenar je urceny jen pro API stage (--stage=api)")
        return
    context.user = fixtures.user()


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
