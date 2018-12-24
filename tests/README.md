# Testy
* **Struktura adresářů:**
    ```bash
    ├── api_steps ........ testovací kroky pro API      
    ├── common_steps ..... společné testovací kroky pro API a UI        
    ├── features ......... popsané funkce a scénáře pro API i UI
    └── ui_steps ......... testovací kroky pro UI
    ```
* ve složkách `api_steps` a `ui_steps` jsou vždy `<nazev_testovane_casti>.py` soubory pokrývající 
testovanou součást aplikace popsanou v `features/<nazev_testovane_casti>.feature`, dále je zde soubor `common.py`,
který obsahuje kroky, které jsou používané pro více testovaných částí v dané složce (tedy API, respektive UI, 
nikoliv obě najednou, viz. další odrážka)
* složka `common_steps` obsahuje naproti tomu soubory `<nazev_testovane_casti>.py`, které jsou společné pro testování
UI i API dané části
* soubor `helpers.py` obsahuje pomocné funkce, které jsou používány napříč všemi testy
* soubory `api_environment.py` a `ui_environment.py` obsahují obecné nastavení prostředí pro dané testy, tedy pro
 API a UI - např. nastavení prohlížeče, klienta...
