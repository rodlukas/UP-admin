# Testy
V této složce se nachází **rozsáhlé testy API i frontendu** tvořící základ aplikace. Testy se automaticky spouští na CI a lze je spustit i na lokálním prostředí.

Testování je postaveno na **BDD frameworku [behave](https://github.com/behave/behave)** – testové scénáře jsou psány přirozeným jazykem, podle nich se spouští konkrétní testy. Pro pokročilejší integraci *behave* s Djangem je použité [behave-django](https://github.com/behave/behave-django).

Pro **testování UI** se používá [Selenium](https://github.com/SeleniumHQ/selenium), konkrétně [oficiální binding pro Python](https://seleniumhq.github.io/selenium/docs/api/py/index.html). Pro jednoduchý přístup k elementům stránky je zaveden jednotný vlastní HTML atribut `data-qa` (ve výjimečných případech toto nelze a používá se přímo `id` elementu – např. komponenty s [React Select](https://github.com/JedWatson/react-select) používají React props `inputId` a `classNamePrefix`).
## Struktura adresářů
```bash
├── api_steps ........ testovací kroky pro API      
├── common_steps ..... společné testovací kroky pro API a UI        
├── features ......... popsané funkce a scénáře pro API i UI
└── ui_steps ......... testovací kroky pro UI
```
Ve **složkách [`api_steps`](api_steps) a [`ui_steps`](ui_steps)** jsou soubory s názvy **`<testovana_cast>.py`** – ty pokrývají danou testovanou část aplikace popsanou v souboru `features/<testovana_cast>.feature` (např. skupiny, klienty...). Dále je v obou složkách vždy soubor **`helpers.py`**,
který obsahuje pomocné funkce používané v rámci dané složky.

Složka **[`common_steps`](common_steps)** obsahuje kroky, které jsou používané pro API i UI testy dané části `<testovana_cast>.py`.

Soubor **[`common_helpers.py`](common_helpers.py)** obsahuje pomocné funkce, které jsou používány pro API i UI testy. **Soubory [`api_environment.py`](api_environment.py) a [`ui_environment.py`](ui_environment.py)** obsahují obecné nastavení prostředí pro dané API/UI testy (např. nastavení prohlížeče, klienta...).

## Spouštění testů
K dispozici jsou **dvě různé sady testů (tzv. *stage*): testy UI a testy API**. 
Pro spuštění konkrétní sady tedy stačí tyto příkazy:
* spuštění **UI testů:** `$ python manage.py behave --stage=ui`,
* spuštění **API testů:** `$ python manage.py behave --stage=api`.

> **Tip pro UI testy:** ve výchozím nastavení běží UI testy v tzv. *headless* módu prohlížeče, tedy bez GUI (prohlížeč není vidět), pokud chcete průběh UI testů (postupné proklikávání a psaní v aplikaci) vidět, stačí upravit v [souboru .env](../.env) řádek s `HEADLESS` na: `HEADLESS=False`.

Testování lze ještě dále zúžit na **konkrétní testovanou část či operaci (označené tzv. *tagem*)** z dané sady testů (*stage*). Pro jednoduchost jsou *tagy* pro testované části totožné s názvy souborů testových scénářů (`features/*.features`) i implementací testů (`api_steps/*.py` a `ui_steps/*.py`). *Tagem* lze, jak bylo řečeno, také zúžit testy na prováděné operace s danou entitou, konkrétně jsou k dispozici *tagy* pro CRUD operace (`add`, `delete` a `edit`) a také pro přihlášení/odhlášení (`login` a `logout`).

**Tabulka s jednotlivými testovanými částmi:**

| testovaná část | název *tagu* i souborů s testy |
| --- | --- |
| zájemci o kurzy | `applications` |
| stavy účasti | `attendancestates` |
| klienti | `clients` |
| kurzy | `courses` |
| skupiny | `groups` |
| lekce | `lectures` |
| přihlášení/odhlášení | `login_logout` |

Příklad spuštění testů API pro klienty a lekce – tedy testů ze *stage* (sady testů) **API** s *tagy* (testovanými částmi) `clients`:
```bash
$ python manage.py behave --stage=api --tags=clients,lectures
```
Příklad spuštění testů UI jen pro skupiny:
```bash
$ python manage.py behave --stage=ui --tags=groups
```

> **Tip pro spouštění velkého množství testů:** pro jednodušší a přehlednější výpis informací o průběhu testů v konzoli je vhodné k příkazu pro spuštění testů přidat argument `--format=progress3` (viz [dokumentace behave](https://behave.readthedocs.io/en/latest/formatters.html?highlight=progress3#formatters)).

## Poznámky
* Společné kroky pro behave testy se klasicky importují, např. `from tests.common_steps import groups`, IDE tento import ale 
vzhledem ke způsobu fungování behave označí jako nepoužitý a při optimalizacích jej může odstranit. Proto je u těchto importů
direktiva `# noinspection PyUnresolvedReferences`, která tomuto zamezí a zároveň umožní automatickou optimalizaci importů
nad celým projektem bez výjimek.
* Vzhledem k časové náročnosti UI testů je připraven pro rychlé (smoke) testování tag `fast.row1.1` – od každé funkcionality se 
vyzkouší jeden nejdůležitější příklad reprezentující nejčastější použití. Tyto testy se hodí zejména pro rychlý lokální test
před zapsáním změn do repozitáře.
