## Základní informace o aplikaci
* Aplikaci jsem vytvořil v roce 2018 v rámci BP na FIT ČVUT - [Repozitář s BP](https://github.com/rodlukas/bachelors-thesis), od té doby je v projektu [Úspěšný prvňáček](https://uspesnyprvnacek.cz/) úspěšně denně používána a nadále na ni pracuji a rozšiřuji ji
* **Klíčové funkce aplikace:**
    * evidence klientů a skupin klientů docházejících na lekce kurzů
    * evidence lekcí klientů a skupin včetně předplacených - stav účasti, platba, datum, čas, zrušení, poznámky
    * kontrola časových konfliktů lekcí
    * automatické rušení lekcí když nikdo nemá přijít
    * automatické vytváření předplacených náhrad lekcí při omluvě předem
    * upozornění, že má klient příště platit
    * zobrazení lekcí v kartě klienta/skupiny, v diáři a na hlavní stránce dnešní přehled
    * evidence zájemců o kurzy
    * konfigurace kurzů a stavů účasti
    * propojení s API Fio Banky - na hlavní stránce se přehledně zobrazují transakce z účtu
    * automatický odhad kurzu pro nově přidávané lekce
    * respektování a kontrola všech omezení daných danou doménou (např. duplicity apod.)
    * automatické přidání předplacené lekce při omluvě/zrušení lekce ze strany lektorky
    * funkce pro vedení aktivních a neaktivních klientů a skupin
    * *... (výčet není konečný)*
* Backend v [Djangu](https://www.djangoproject.com/) (Python), frontend v [Reactu](https://reactjs.org/) (JS), databáze PostgreSQL
* Frontend jako SPA ([Single-Page-App](https://en.wikipedia.org/wiki/Single-page_application)), použitý Bootstrap ([reactstrap](https://reactstrap.github.io/)) a mnoho dalších knihoven, responzivní aplikace
    * aplikace odolná proti pádům JS díky [React Error Boundaries](https://reactjs.org/docs/error-boundaries.html)
    * pro zrychlení načítání se používá lazy loading [`React.lazy` + `React Suspense`](https://reactjs.org/docs/code-splitting.html)
* Nasazeno na [Heroku](https://www.heroku.com/)
* REST API přes [Django REST Framework](http://www.django-rest-framework.org/)
* [JWT](https://jwt.io/) autentizace, **HTTPS-only** (+ pokročilé zabezpečení, viz. [1](https://docs.djangoproject.com/en/2.0/howto/deployment/checklist/), [2](https://wsvincent.com/django-best-practices/))
* Pokročilé debugování na lokálním i vzdáleném prostředí díky [Django Debug Toolbar](https://github.com/jazzband/django-debug-toolbar) a jeho doplňku [Django Debug Toolbar Request History](https://github.com/djsutho/django-debug-toolbar-request-history/)
* Každý den ve 3:00 se provádí automatická záloha databáze (viz. https://devcenter.heroku.com/articles/heroku-postgres-backups#scheduling-backups)
* [využité tipy k optimalizaci Djanga](https://www.revsys.com/tidbits/django-performance-simple-things/) + [další podobný článek](http://ses4j.github.io/2015/11/23/optimizing-slow-django-rest-framework-performance/)
* **respektování standardů**
    * https://pep8.org a také (tam, kde to dává smysl) https://12factor.net/ a https://roca-style.org/
* 4 prostředí (3x PaaS [Heroku](https://www.heroku.com/)):
    * **vývojové (lokální)** - pro lokální vývoj, žlutá lišta,
    * **testing** - umožňuje zapnout debugování, deploy každého commitu, modrá lišta
    * **staging** - stejná verze aplikace jako na produkci, deploy při release, zelená lišta
    * **produkce** - používá klient, deploy při release (jako staging)
* logování z Heroku do *[Logentries](https://logentries.com/)* (logy se uchovávají po 7 dnů, tříděné podle typu prostředí)
* odchytávání chyb (v Pythonu i JS) přes *[Sentry](https://sentry.io/)* (tříděné podle typu prostředí, aktivní na produkci, testing i staging prostředí)
    * při chybě na frontendu možnost poslat zpětnou vazbu vázanou ke konkrétní chybě díky propojení *Sentry* a [React Error Boundaries](https://reactjs.org/docs/error-boundaries.html)
* propojení se *[Slackem](https://slack.com/)*
* napojení na *[Google Analytics](https://analytics.google.com/)*
* **CI a CD** má na starost [Travis](https://travis-ci.com/) - automatizovaný build, testování i nasazení 
na různá prostředí, automaticky prováděné pokročilejší skripty např. pro automatické nastavení verze do aplikace,
tokenů apod.
* kompletní vývoj v IDE *Pycharm (Professional Edition)*
* rozsáhlé testy API i frontendu spustitelné na CI i na lokálním PC
    * BDD framework [behave](https://github.com/behave/behave) - testové scénáře jsou psány přirozeným jazykem, podle nich se spouští konkrétní testy
    * pro testování UI se používá [selenium](https://github.com/SeleniumHQ/selenium)
    * více viz. [docs README](/docs/README.md)
* **Struktura repozitáře:**
    ```bash
    ├── .idea ........ nastavení pro IDE (Pycharm od Jetbrains)      
    ├── admin ........ Django aplikace pro samotnou webovou aplikaci        
    ├── api .......... Django aplikace pro API
    ├── docs ......... dokumenty k aplikaci     
    ├── frontend ..... klientská část webové aplikace   
    ├── scripts ...... skripty pro CI/CD
    ├── staticfiles .. složka pro statické soubory (prázdná, přesun až na CI)
    ├── tests ........ kompletní testy API i frontendu
    └── up ........... celý Django projekt
    ```
---
