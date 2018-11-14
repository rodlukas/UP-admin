## Základní informace o aplikaci
* Aplikace vytvořena v roce 2018 v rámci BP na FIT ČVUT - [Repozitář s BP](https://github.com/rodlukas/bachelors-thesis)
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
    * *... (výčet není konečný)*
* Backend v [Djangu](https://www.djangoproject.com/) (Python), frontend v [Reactu](https://reactjs.org/) (JS), databáze PostgreSQL
* Frontend jako SPA ([Single-Page-App](https://en.wikipedia.org/wiki/Single-page_application)), použitý Bootstrap ([reactstrap](https://reactstrap.github.io/)) a mnoho dalších knihoven, responzivní aplikace
* Nasazeno na [Heroku](https://www.heroku.com/)
* REST API přes [Django REST Framework](http://www.django-rest-framework.org/)
* [JWT](https://jwt.io/) autentizace
* Pokročilé debugování na lokálním i vzdáleném prostředí díky [Django Debug Toolbar](https://github.com/jazzband/django-debug-toolbar) a jeho doplňku [Django Debug Toolbar Request History](https://github.com/djsutho/django-debug-toolbar-request-history/)
* Každý den ve 3:00 se provádí automatická záloha databáze (viz. https://devcenter.heroku.com/articles/heroku-postgres-backups#scheduling-backups)
* [využité tipy k optimalizaci Djanga](https://www.revsys.com/tidbits/django-performance-simple-things/) + [další podobný článek](http://ses4j.github.io/2015/11/23/optimizing-slow-django-rest-framework-performance/)
* **respektování standardů**
    * https://pep8.org a také (tam, kde to dává smysl) https://12factor.net/ a https://roca-style.org/
* 4 prostředí:
    * **vývojové (lokální)** - pro lokální vývoj, žlutá lišta,
    * **testing** - umožňuje zapnout debugování, deploy každého commitu, modrá lišta
    * **staging** - stejná verze aplikace jako na produkci, deploy při release, zelená lišta
    * **produkce** - používá klient, deploy při release (jako staging)
* logování do *[Logentries](https://logentries.com/)* (logy se uchovávají po 7 dnů)
* odchytávání chyb přes *[Sentry](https://sentry.io/)*, propojení se *[Slackem](https://slack.com/)*
* **CI a CD** má na starost [Travis](https://travis-ci.com/) - automatizovaný build, testování i nasazení na různá prostředí
* kompletní vývoj v IDE *Pycharm (Professional Edition)*
* **Struktura repozitáře:**
    ```bash
    ├── .idea ........ nastavení pro IDE (Pycharm od Jetbrains)      
    ├── admin ........ Django aplikace pro samotnou webovou aplikaci        
    ├── api .......... Django aplikace pro API
    ├── docs ......... dokumenty k aplikaci     
    ├── frontend ..... klientská část webové aplikace   
    ├── scripts ...... skripty pro CI/CD
    ├── staticfiles .. složka pro statické soubory (prázdná, přesun až na CI)
    └── up ........... celý Django projekt
    ```
---
