from django.conf import settings
from selenium.common.exceptions import (
    NoSuchElementException,
    StaleElementReferenceException,
    TimeoutException,
)
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

from tests import common_helpers

WAIT_TIME = settings.TESTS_WAIT_TIME
WAIT_TIME_SHORT = max(1, WAIT_TIME - 2)
WAIT_TIME_VERY_SHORT = 0.5


def wait_loading_cycle(driver):
    # kratka kontrola, zda se loading objevi se zpozdenim; pokud ano, pockej na jeho konec
    try:
        WebDriverWait(driver, WAIT_TIME_VERY_SHORT).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "[data-qa=loading]"))
        )
    except TimeoutException:
        # loading se neobjevil v ramci kratkeho casu, nepokracuj v cekani
        return
    else:
        wait_loading_ends(driver)


def submit_form(context, button_name):
    # klikni na tlacitko s danym data-qa atributem
    # - klasicke element.submit() se nepouziva proto, ze netestuje typicke chovani uzivatele - kliknuti na tlacitko
    #   ulozeni, ale odeslani Enterem, tedy napr. pokud by bylo tlacitko disabled, testy projdou, ale uzivateli to nejde
    button = context.browser.find_element(By.CSS_SELECTOR, f"[data-qa={button_name}]")
    button.click()


def convert_fa_bool(classes):
    # preved zobrazenou FontAwesome ikonu na boolean
    classes_list = classes.split()
    return "fa-check" in classes_list  # jinak je ikona "fa-times"


def check_fa_bool(visible, classes):
    # sedi hodnota visible se zobrazenou FontAwesome ikonou?
    fa_boolean = convert_fa_bool(classes)
    if (visible and fa_boolean) or (not visible and not fa_boolean):
        return True
    return False


def get_tooltip_text(driver, element):
    # 2 pokusy: refetch po mutaci (napr. zmena platby) prekresluje stranku a layout se muze
    # posunout pod stojicim kurzorem - Firefox pak vyvola mouseleave bez pohybu mysi a cerstve
    # otevreny tooltip se zavre driv, nez ho stihneme precist (s vypnutymi animacemi, napr.
    # prefers-reduced-motion na CI, okamzite); druhy klik presune kurzor na aktualni pozici
    # elementu, vyvola novy mouseenter a tooltip znovu otevre
    # timeouty schvalne kratke (tooltip se ukazuje hned po najeti) - tato funkce bezi i uvnitr
    # pollovanych find_* lambd a dlouhym cekanim by vyhladovela WAIT_TIME rozpocet celeho kroku
    tooltip_text = None
    for attempt, timeout in enumerate((WAIT_TIME_VERY_SHORT, WAIT_TIME_SHORT)):
        # klikni mysi na element
        element.click()
        try:
            # tooltip dohledavame pres aria-describedby kliknuteho elementu (Mantine ho
            # na trigger nastavuje jen po dobu otevreni) - globalni [role='tooltip'] by
            # mohl matchnout cizi, uz otevreny tooltip jineho triggeru (kurzor zaparkovany
            # po predchozim cteni muze hoverovat jiny element) a vratit spatny text
            WebDriverWait(driver, timeout).until(
                lambda _: element.get_attribute("aria-describedby")
            )
            tooltip_id = element.get_attribute("aria-describedby")
            # poznamka: .text se cte az po novem find_element, ne na referenci z .until(),
            # ktera muze byt stale kvuli prekresleni DOM (StaleElementReferenceException)
            tooltip_text = driver.find_element(By.ID, tooltip_id).text
            break
        except (TimeoutException, NoSuchElementException, StaleElementReferenceException):
            if attempt == 1:
                raise
            # odsun kurzor mimo element, aby dalsi klik vyvolal novy mouseenter
            ActionChains(driver).move_to_element(
                driver.find_element(By.TAG_NAME, "body")
            ).perform()
    # odstran mys z elementu, aby se tooltip skryl
    ActionChains(driver).move_to_element(driver.find_element(By.TAG_NAME, "body")).perform()
    # vrat text tooltipu
    return tooltip_text


def clear_input(element):
    """Vymaze obsah ovladaneho (React) inputu znak po znaku.

    `element.clear()` nastavi hodnotu pres WebDriver primo a jednotlive prohlizece se
    lisi v tom, jake udalosti u toho posilaji - React onChange se nemusi spustit vubec
    a controlled input si pri dalsim renderu vrati puvodni hodnotu (nasledny send_keys
    pak pise ZA ni). Mazani BACK_SPACE je bezne uzivatelske chovani a chova se stejne
    ve vsech prohlizecich (stejny duvod jako v `combobox_insert`).
    """
    for _ in range(len(element.get_attribute("value") or "")):
        element.send_keys(Keys.BACK_SPACE)


def wait_form_settings_visible(driver):
    WebDriverWait(driver, WAIT_TIME).until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, "[data-qa=form_settings]"))
    )


def wait_loading_ends(driver):
    WebDriverWait(driver, WAIT_TIME).until_not(
        EC.presence_of_element_located((By.CSS_SELECTOR, "[data-qa=loading]"))
    )


def frontend_empty_str(text):
    # znak musi odpovidat komponente NoInfo ve frontendu
    return "—" if text == "" else text


def wait_for_alert_and_accept(driver):
    WebDriverWait(driver, WAIT_TIME_SHORT).until(EC.alert_is_present())
    driver.switch_to.alert.accept()


def wait_combobox_options(driver, timeout=None):
    """Pocka na otevreny portalovany dropdown Mantine comboboxu a vrati jeho volby.

    Volby se hledaji uvnitr [role="listbox"] - diky `keepMounted: false` v theme.ts
    je v DOM nanejvys jeden (prave otevreny) dropdown; zavrene comboboxy v dokumentu
    zadne [role="option"] elementy nenechavaji. (Mantine na inputu neaktualizuje
    aria-expanded/aria-controls, podle nich se proto cekat neda.)
    """

    def _visible_options(_driver):
        for listbox in _driver.find_elements(By.CSS_SELECTOR, "[role='listbox']"):
            try:
                options = listbox.find_elements(By.CSS_SELECTOR, "[role='option']")
                if options and options[0].is_displayed():
                    return options
            except StaleElementReferenceException:
                # dropdown se behem dotazovani odpojil (zavreni/preklopeni) - zkus dalsi poll
                continue
        return False

    return WebDriverWait(driver, timeout if timeout is not None else WAIT_TIME_SHORT).until(
        _visible_options
    )


def _combobox_selection_applied(element, value):
    """Overi, ze se vybrana volba skutecne propsala do Mantine comboboxu.

    MultiSelect se MUSI overovat pres pilly (vybrane volby vedle inputu) - jeho
    search input cisti Mantine jen pri USPESNEM vyberu, takze po neuspesnem kliku
    by v inputu zustal napsany hledany text a kontrola hodnoty inputu by dala
    falesny uspech. U jednoducheho Selectu input zobrazuje label vybrane volby
    (kontrola je slabsi - napsany text je shodny s ocekavanym labelem).
    """
    try:
        multiselect_root = element.find_element(
            By.XPATH, "ancestor::div[contains(@class, 'mantine-MultiSelect-root')]"
        )
    except NoSuchElementException:
        return (element.get_attribute("value") or "") == value
    return any(
        pill.text == value
        for pill in multiselect_root.find_elements(By.CSS_SELECTOR, ".mantine-Pill-label")
    )


def combobox_insert(driver, element, value):
    """Vlozi hodnotu do Mantine Selectu/MultiSelectu (combobox).

    Vrati True, pokud byla volba nalezena, vybrana a vyber se skutecne propsal;
    jinak False (a dropdown pred navratem zavre presunem fokusu Tabem).
    """
    if not value:
        # prazdna hodnota = zamerne nevyplneny (povinny) select; smaz pripadny obsah
        # a zavri dropdown presunem fokusu (mazani ho mohlo otevrit a prazdny retezec
        # nefiltruje - klik na prvni volbu by omylem vybral platnou hodnotu)
        for _ in range(len(element.get_attribute("value") or "")):
            element.send_keys(Keys.BACK_SPACE)
        element.send_keys(Keys.TAB)
        return False
    # 2 pokusy: klik na volbu se muze "neujmout", kdyz React behem psani resetuje
    # controlled input (re-render po smazani vybrane hodnoty) - po kliku proto vyber
    # overujeme a pripadne cely postup jednou zopakujeme
    for _ in range(2):
        # U searchable selectu input obsahuje label aktualne vybrane volby (edit
        # formulare) - smaz ho cely po znacich, jinak by se hledany text pripojil
        # za nej a filtr by nic nenasel. (react-select mazal celou volbu jednim
        # BACK_SPACE, Mantine jen znak.)
        for _ in range(len(element.get_attribute("value") or "")):
            element.send_keys(Keys.BACK_SPACE)
        element.send_keys(value)
        try:
            options = wait_combobox_options(driver)
        except TimeoutException:
            # zadna volba se neobjevila - zavri pripadny dropdown presunem fokusu (Tab)
            # a signalizuj neuspech; Escape nelze pouzit, probublava do Modalu, ktery
            # se pokusi zavrit a aplikace zobrazi confirm alert "zavrit bez ulozeni?"
            element.send_keys(Keys.TAB)
            return False
        # klikni na volbu s presne odpovidajicim textem - NE slepe na prvni; pri
        # resetu inputu filtr neplati a prvni volba by byla nahodna
        try:
            matched_option = next(
                (option for option in options if option.text == value), None
            )
        except StaleElementReferenceException:
            # dropdown se behem cteni textu voleb prekreslil - zopakuj cely pokus
            continue
        if matched_option is None:
            element.send_keys(Keys.TAB)
            return False
        try:
            matched_option.click()
        except StaleElementReferenceException:
            # dropdown se mezitim prekreslil - zopakuj cely pokus
            continue
        try:
            WebDriverWait(
                driver,
                WAIT_TIME_SHORT,
                ignored_exceptions=(StaleElementReferenceException,),
            ).until(lambda _d: _combobox_selection_applied(element, value))
            return True
        except TimeoutException:
            # pozn.: u MultiSelectu by opakovany klik na uz vybranou volbu vyber zrusil -
            # pripadny flake se tedy projevi hlucne (False), nikdy tichym spatnym vyberem
            continue
    # vsechny pokusy vycerpane - dropdown muze byt porad otevreny, zavri ho Tabem
    element.send_keys(Keys.TAB)
    return False


def open_settings(driver):
    driver.find_element(By.CSS_SELECTOR, "[data-qa=menu_settings]").click()


def open_groups(driver):
    driver.find_element(By.CSS_SELECTOR, "[data-qa=menu_groups]").click()


def open_clients(driver):
    driver.find_element(By.CSS_SELECTOR, "[data-qa=menu_clients]").click()


def toggle_switcher_active(driver, active):
    button_str = "button_switcher_active" if active else "button_switcher_inactive"
    driver.find_element(By.CSS_SELECTOR, f"[data-qa={button_str}]").click()


def _paginated_pages(driver):
    """
    Generátor: postupně navštíví každou stránku stránkování (viz `useDataTable`) a po
    každém příchodu na ni vydá řízení zpět volajícímu — ten si sám vytáhne živé prvky
    té konkrétní stránky (`driver.find_elements(...)`), než generátor pokročí dál.
    Bez stránkování (`[data-qa=pagination]` v DOMu není) vydá řízení jen jednou.

    Nevrací prvky sám: prvek nalezený na stránce N je po přechodu na stránku N+1 pryč
    z DOMu (React ho odmountuje) a další interakce s ním skončí
    `StaleElementReferenceException` — proto vždy pracuj s prvky té stránky, na které
    generátor právě je, ne s prvky nasbíranými napříč voláními.
    """
    try:
        pagination = driver.find_element(By.CSS_SELECTOR, "[data-qa=pagination]")
    except NoSuchElementException:
        yield
        return

    # zacni vzdy na strance 1: cislo "1" je vzdy viditelne (Mantine "boundaries" ho
    # nikdy neschova za vypustku), na rozdil od cisel uprostred delsiho seznamu.
    # `useDataTable` resetuje aktualni stranku jen pri hledani nebo prerazeni, ne pri
    # prepnuti aktivni/neaktivni - bez explicitniho kliku by tak prvni kolo sbiralo
    # radky z toho, kde stranka zustala po predchozim volani
    pagination.find_element(By.XPATH, ".//button[text()='1']").click()
    wait_loading_cycle(driver)
    yield

    # dal uz jen sipka "next" (data-qa="pagination_next", viz useDataTable.ts):
    # cisla stranek uprostred delsiho seznamu Mantine schova za vypustku (siblings=1),
    # ale sipka zustava klikatelna a disabled az na posledni strance
    next_button = pagination.find_element(By.CSS_SELECTOR, "[data-qa=pagination_next]")
    while next_button.get_attribute("disabled") is None:
        next_button.click()
        wait_loading_cycle(driver)
        yield


def _paginated_elements(driver, selector):
    """
    Spočítá prvky přes všechny stránky stránkování — bez toho by `clients_cnt` a obdoby
    nad delším seznamem (víc řádků, než kolik jich `useDataTable` zobrazí na jednu
    stránku) tiše počítaly jen v rámci jedné stránky.

    Vrácený seznam je určený **jen k počítání** (`len(...)`): prvky ze všech stránek
    kromě té poslední jsou v okamžiku návratu už mimo DOM (viz `_paginated_pages`).
    Na hledání a interakci (klik) použij `_find_paginated_row`.
    """
    elements = []
    for _ in _paginated_pages(driver):
        elements += driver.find_elements(By.CSS_SELECTOR, selector)
    return elements


def _find_paginated_row(driver, selector, matches):
    """
    Projde všechny stránky stránkování a vrátí první živý prvek `selector`, pro který
    `matches(prvek)` vrátí pravdivou hodnotu — na rozdíl od `_paginated_elements` je
    vrácený prvek platný (žádná další navigace mezi nalezením prvku a jeho použitím
    voláním kódem), protože se vrací hned po nálezu na té stránce, kde se nachází.
    """
    for _ in _paginated_pages(driver):
        for element in driver.find_elements(By.CSS_SELECTOR, selector):
            if matches(element):
                return element
    return None


def get_clients(driver, active):
    toggle_switcher_active(driver, active)
    # pockej na pripadny loading cyklus (robustnejsi nez pouze ends)
    wait_loading_cycle(driver)
    return _paginated_elements(driver, "[data-qa=client]")


def get_groups(driver, active):
    toggle_switcher_active(driver, active)
    # pockej na pripadny loading cyklus (robustnejsi nez pouze ends)
    wait_loading_cycle(driver)
    return _paginated_elements(driver, "[data-qa=group]")


def close_modal(driver):
    # zavri modalni okno; Mantine Modal pouziva .mantine-Modal-close class na tlacitku
    driver.find_element(By.CSS_SELECTOR, ".mantine-Modal-close").click()
    # pokud se zobrazi alert s upozornenim na neulozene zmeny, zavri ho
    try:
        wait_for_alert_and_accept(driver)
    except TimeoutException:
        # alert se nezobrazil (zadne zmeny se neprovadely)
        pass


def is_modal_open(driver):
    # zjisti, zda je otevrene nejake modal okno (Mantine Modal nastavuje aria-modal="true")
    return len(driver.find_elements(By.CSS_SELECTOR, "[aria-modal='true']")) != 0


def wait_modal_closed(driver):
    # pockej na zavreni modalu
    WebDriverWait(driver, WAIT_TIME).until_not(lambda d: is_modal_open(d))


def _find_group_with_activity(activity, context, name, open_card=False, validate_context=False):
    # nastav pozadovanou ne/aktivitu (stejne jako driv delal get_groups)
    toggle_switcher_active(context.browser, activity)
    wait_loading_cycle(context.browser)

    # najdena data se ulozi sem - `matches` bezi na zive strance, `context` se plni
    # az po potvrzenem nalezu, aby se nezapsal z radku, ktery nakonec neodpovidal
    found = {}

    def matches(group):
        found_name_element = group.find_element(By.CSS_SELECTOR, "[data-qa=group_name]")
        found_name = found_name_element.text
        # srovnej identifikatory
        if found_name != name:
            return False
        # identifikatory sedi, otestuj pripadna dalsi zaslana data
        found_course = group.find_element(By.CSS_SELECTOR, "[data-qa=course_name]").text
        found_members = [
            element.text
            for element in group.find_elements(By.CSS_SELECTOR, "[data-qa=client_name]")
        ]
        if validate_context and not (
            set(found_members) == set(context.members)
            and found_course == context.course
            and activity == context.active
        ):
            return False
        found["name_element"] = found_name_element
        found["name"] = found_name
        found["course"] = found_course
        found["members"] = found_members
        return True

    found_group = _find_paginated_row(context.browser, "[data-qa=group]", matches)
    if found_group is None:
        return None

    # uloz stara data do kontextu pro pripadne overeni spravnosti
    context.old_group_name = found["name"]
    context.old_group_course = found["course"]
    context.old_group_members = found["members"]
    context.old_group_activity = activity
    if open_card:
        found["name_element"].click()
    return found_group


def find_group(context, name, open_card=False, validate_context=False):
    active_group = _find_group_with_activity(True, context, name, open_card, validate_context)
    if active_group:
        return active_group
    inactive_group = _find_group_with_activity(False, context, name, open_card, validate_context)
    if inactive_group:
        return inactive_group
    return None


def _find_client_with_activity(activity, context, full_name, open_card, **data):
    # nastav pozadovanou ne/aktivitu (stejne jako driv delal get_clients)
    toggle_switcher_active(context.browser, activity)
    wait_loading_cycle(context.browser)

    # najdena data se ulozi sem - `matches` bezi na zive strance, `context` se plni
    # az po potvrzenem nalezu, aby se nezapsal z radku, ktery nakonec neodpovidal
    found = {}

    def matches(client):
        found_name_element = client.find_element(By.CSS_SELECTOR, "[data-qa=client_name]")
        found_name = found_name_element.text
        # srovnej identifikatory
        if found_name != full_name:
            return False
        found_phone = client.find_element(By.CSS_SELECTOR, "[data-qa=client_phone]").text
        found_email = client.find_element(By.CSS_SELECTOR, "[data-qa=client_email]").text
        found_note = client.find_element(By.CSS_SELECTOR, "[data-qa=client_note]").text
        found_phone_value = common_helpers.shrink_str(found_phone)
        # identifikatory sedi, otestuj pripadna dalsi zaslana data
        if data and not (
            found_phone_value == frontend_empty_str(common_helpers.shrink_str(data["phone"]))
            and found_email == frontend_empty_str(data["email"])
            and found_note == frontend_empty_str(data["note"])
            and activity == data["active"]
        ):
            return False
        found["name_element"] = found_name_element
        found["name"] = found_name
        found["phone"] = found_phone_value
        found["email"] = found_email
        found["note"] = found_note
        return True

    found_client = _find_paginated_row(context.browser, "[data-qa=client]", matches)
    if found_client is None:
        return None

    # uloz stara data do kontextu pro pripadne overeni spravnosti
    context.old_client_name = found["name"]
    context.old_client_phone = found["phone"]
    context.old_client_email = found["email"]
    context.old_client_note = found["note"]
    context.old_client_activity = activity
    if open_card:
        found["name_element"].click()
    return found_client


def find_client(context, full_name, open_card=False, **data):
    active_client = _find_client_with_activity(True, context, full_name, open_card, **data)
    if active_client:
        return active_client
    inactive_client = _find_client_with_activity(False, context, full_name, open_card, **data)
    if inactive_client:
        return inactive_client
    return None
