# Testy
* **Struktura adresářů:**
    ```bash
    ├── api_steps ........ testovací kroky pro API      
    ├── common_steps ..... společné testovací kroky pro API a UI        
    ├── features ......... popsané funkce a scénáře pro API i UI
    └── ui_steps ......... testovací kroky pro UI
    ```
* ve složkách `api_steps` a `ui_steps` jsou vždy `<nazev_testovane_casti>.py` soubory pokrývající 
testovanou součást aplikace popsanou v `features/<nazev_testovane_casti>.feature`, dále je zde soubor `helpers.py`,
který obsahuje pomocné funkce používané v rámci dané složky
* složka `common_steps` obsahuje kroky, které jsou používané pro API i UI testy dané části: `<nazev_testovane_casti>.py`
* soubor `common_helpers.py` obsahuje pomocné funkce, které jsou používány pro API i UI testy
* soubory `api_environment.py` a `ui_environment.py` obsahují obecné nastavení prostředí pro dané testy, tedy pro
 API a UI - např. nastavení prohlížeče, klienta...

## Spouštění testů
* spuštění pouze UI testů: `python manage.py behave --stage=ui`
* spuštění pouze API testů: `python manage.py behave --stage=api`
* spuštění testů (ze stage `abc`) s tagem `xyz`: `python manage.py behave --stage=abc --tags=xyz`

## Další informace k testům
* pro testy se používá BDD framework [behave](https://github.com/behave/behave), 
pro pokročilejší integraci *behave* s Djangem je použité [behave-django](https://github.com/behave/behave-django)
* pro testování UI se používá [selenium](https://github.com/SeleniumHQ/selenium), 
konkrétně [oficiální binding pro Python](https://seleniumhq.github.io/selenium/docs/api/py/index.html)
    * pro jednoduchý přístup k elementům stránky je zaveden jednotný vlastní HTML atribut `data-qa` 
    (ve výjimečných případech toto nelze a používá se přímo `id` elementu - např. komponenty *react-select*)
