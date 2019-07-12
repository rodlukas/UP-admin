# Webová aplikace pro projekt „Úspěšný prvňáček“ 
<img src="./admin/static/admin/android-chrome-192x192.png" alt="logo" width="60" align="right"/>

[![Build Status](https://travis-ci.com/rodlukas/UP-admin.svg?token=g1rDdptQG4SVzcH6FMo5&branch=master)](https://travis-ci.com/rodlukas/UP-admin)
[![codecov](https://codecov.io/gh/rodlukas/UP-admin/branch/master/graph/badge.svg?token=2kJIBqfP0a)](https://codecov.io/gh/rodlukas/UP-admin)

[Sentry](https://sentry.io/uspesnyprvnacek/up-admin/) | 
[Heroku](https://dashboard.heroku.com/apps) | 
[Slack](https://uspesnyprvnacek.slack.com/messages) | 
Logentries - 
[produkční](https://addons-sso.heroku.com/apps/20c2c1b9-7573-42c9-ba22-cfdc7568f1f9/addons/551eb689-3908-4088-9100-519dfb42e836) / 
[staging](https://addons-sso.heroku.com/apps/e3a9ca55-ccff-46ec-b37f-99ce57c75ee1/addons/f32bd464-be5c-4a70-bdbd-ca4b1c925803) / 
[testing](https://addons-sso.heroku.com/apps/20090cc9-a6a5-46f4-b6ff-516a1bb9ebf3/addons/398b1cfa-4aa4-499a-a3cd-300f2093c4b3) |
[GA](https://analytics.google.com/analytics/web/#/report-home/a53235943w186065128p183124243)

## Obsah
* [Základní informace o aplikaci](#základní-informace-o-aplikaci)
   * [Klíčové funkce aplikace](#klíčové-funkce-aplikace)
   * [Použité technologie](#použité-technologie)
      * [Backend](#backend)
      * [Frontend](#frontend)
   * [Informace o nasazených aplikacích](#informace-o-nasazených-aplikacích)
* [Struktura repozitáře](#struktura-repozitáře)
* [Jak spustit aplikaci](#jak-spustit-aplikaci)
   * [Instalace](#instalace)
   * [Spuštění](#spuštění)
* [Licence](#licence)

## Základní informace o aplikaci
Aplikaci jsem vytvořil v roce 2018 v rámci **bakalářské práce na FIT ČVUT** - vizte [repozitář s textem práce](https://github.com/rodlukas/bachelors-thesis).
Od té doby je v projektu [Úspěšný prvňáček](https://uspesnyprvnacek.cz/) denně úspěšně používána a její rozšiřování a práce na ní stále pokračují ❤️.
### Klíčové funkce aplikace
* **evidence klientů a skupin klientů docházejících na lekce kurzů**
* **evidence lekcí klientů a skupin včetně předplacených - stav účasti, platba, datum, čas, zrušení, poznámky**
* **evidence zájemců o kurzy**
* **zobrazení lekcí ve 3 formách: v kartě klienta/skupiny, v diáři a na hlavní stránce v přehledu pro dnešní den**
* kontrola časových konfliktů lekcí
* automatické rušení lekcí když nikdo nemá přijít
* automatické vytváření předplacených náhrad lekcí při omluvě předem
* upozornění, že má klient příště platit
* konfigurace kurzů a stavů účasti
* propojení s API Fio Banky - na hlavní stránce se přehledně zobrazují nedávné transakce z účtu
* automatický odhad kurzu pro nově přidávané lekce
* respektování a kontrola všech omezení daných danou doménou (např. duplicity apod.)
* automatické přidání předplacené lekce při omluvě/zrušení lekce ze strany lektorky
* funkce pro vedení aktivních a neaktivních klientů a skupin
* *... (výčet není konečný)*
### Použité technologie
Aplikace je rozdělena na **frontend a backend**, ty spolu komunikují přes **REST API** zabezpečené **[JWT](https://jwt.io/) autentizací**.
Jako databáze se používá [PostgreSQL 11](https://www.postgresql.org/).
#### Backend
Obsahuje veškerou logiku a pro klienta vystavuje **REST API**, postaven na těchto technologiích:
* [Python 3.7](https://www.python.org/),
* [Django 2](https://www.djangoproject.com/),
* [Django REST framework 3](https://www.django-rest-framework.org/),
* [djangorestframework-simplejwt](https://github.com/davesque/django-rest-framework-simplejwt),
* [a další...](/Pipfile)

V Djangu jsou pro mnohonásobné zrychlení pokročile optimalizované komplexní SQL dotazy (viz články [[1]](https://www.revsys.com/tidbits/django-performance-simple-things/), [[2]](http://ses4j.github.io/2015/11/23/optimizing-slow-django-rest-framework-performance/)).
Aplikace umožňuje pokročilé debugování na lokálním i vzdáleném prostředí díky [Django Debug Toolbar](https://github.com/jazzband/django-debug-toolbar) a jeho doplňku [Django Debug Toolbar Request History](https://github.com/djsutho/django-debug-toolbar-request-history/).
#### Frontend
Responzivní JS *(ES2018)* webová aplikace typu SPA ([Single-Page-App](https://en.wikipedia.org/wiki/Single-page_application)) postavená na těchto technologiích:
* [React 16.8](https://reactjs.org/),
* [Bootstrap 4](https://getbootstrap.com/) (s [Reactstrap](https://reactstrap.github.io/)),
* [React Router 4](https://reacttraining.com/react-router/),
* [a další...](/frontend/package.json)

Aplikace je odolná proti pádům JS díky [React Error Boundaries](https://reactjs.org/docs/error-boundaries.html).
Pro zrychlení načítání celé aplikace se používá lazy loading [`React.lazy` + `React Suspense`](https://reactjs.org/docs/code-splitting.html).
### Informace o nasazených aplikacích
Aplikace aktuálně běží na 4 prostředích (3x PaaS [Heroku](https://www.heroku.com/)), které se liší příslušnou nasazenou verzí aplikace, 
konkrétní instancí databáze, umožňují různé úrovně debugování a kosmeticky se liší také barvou menu. 

> **Seznam prostředí:**
> * **vývojové (lokální)** - pro lokální vývoj *(žluté menu)*,
> * **testing** - umožňuje zapnout debugování, deploy každého commitu *(modré menu)*,
> * **staging** - stejná verze aplikace jako na produkci, deploy při release *(zelené menu)*,
> * **produkce** - produkční verze používaná zákazníkem, deploy při release (jako staging) *(bílé menu)*.

* Nasazené aplikace jsou **HTTPS-only** (+ pokročilé zabezpečení, 
viz [[1]](https://docs.djangoproject.com/en/2.0/howto/deployment/checklist/), [[2]](https://wsvincent.com/django-best-practices/)).
* Na produkci se každý den ve 3:00 provádí 
[automatická záloha databáze](https://devcenter.heroku.com/articles/heroku-postgres-backups#scheduling-backups).
* **Aplikace jsou napojené na další služby:**
    * [Slack](https://slack.com/),
    * [Google Analytics](https://analytics.google.com/),
    * **logování** z Heroku se zasílá do [Logentries](https://logentries.com/) (logy se uchovávají po 7 dnů, tříděné podle typu prostředí)
    * **odchytávání chyb na backendu i frontendu** přes [Sentry](https://sentry.io/) (tříděné podle typu prostředí, aktivní na produkci, testing i staging prostředí)
        * při chybě na frontendu je možné poslat zpětnou vazbu vázanou ke konkrétní chybě díky propojení Sentry a [React Error Boundaries](https://reactjs.org/docs/error-boundaries.html)
    * **CI a CD** má na starost [Travis](https://travis-ci.com/) - automatizovaný build, testování i nasazení na různá prostředí, automaticky prováděné pokročilejší skripty např. pro automatické zapsání verze do aplikace, práci s tokeny, nahrání sestaveného frontendu do assetů k releasu na GitHubu, napojení na služby pro výpočet pokrytí kódu a další.
* Aplikace **respektuje standardy** [PEP 8](https://pep8.org), [12-Factor App](https://12factor.net/), [ROCA](https://roca-style.org/).
* Kompletní vývoj aplikace probíhá v IDE *[Pycharm (Professional Edition)](https://www.jetbrains.com/pycharm/)*.
* Základ aplikace tvoří **rozsáhlé testy API i frontendu**, které se automaticky spouští na CI a lze je spustit i na lokálním prostředí.
    * Testování je postaveno na **BDD frameworku [behave](https://github.com/behave/behave)** - 
    testové scénáře jsou psány přirozeným jazykem, podle nich se spouští konkrétní testy.
    * Pro **testování UI** se používá [selenium](https://github.com/SeleniumHQ/selenium).
    * **Další informace o testech: [tests/README.md](/tests/README.md)**

## Struktura repozitáře
```bash
├── .idea ........ nastavení pro IDE (Pycharm od Jetbrains)      
├── admin ........ Django aplikace pro samotnou webovou aplikaci        
├── api .......... Django aplikace pro API
├── docs ......... další dokumenty k aplikaci     
├── frontend ..... klientská část webové aplikace   
├── scripts ...... skripty pro CI/CD
├── staticfiles .. složka pro statické soubory (prázdná, přesun až na CI)
├── tests ........ kompletní testy API i frontendu
└── up ........... celý Django projekt
```
---

## Jak spustit aplikaci
Aplikaci lze spustit na lokálním prostředí ve dvou režimech, výchozí je klasický vývojový - ten obsahuje pokročilé debugovací
nástroje, spouští se Django vývojový server a také webpack-dev-server pro frontend. Vzhledem k práci s privátními npm registry (viz [níže](#npmpro)) nelze samozřejmě bez příslušných tokenů sestavovat frontend, proto zde budu popisovat postup spuštění ve druhém režimu - produkční verze aplikace, tedy ta, která je nejblíže verzi u zákazníka.
### Požadavky
Pro spuštění je potřeba mít v OS nainstalováno:
* [Python 3](https://www.python.org/downloads/) (konkrétní verze viz [Pipfile](/Pipfile))
* [Pipenv](https://docs.pipenv.org/en/latest/install/#installing-pipenv)
* [Git](https://git-scm.com/downloads)

<a name="npmpro">
  
> **Poznámka:** Node.js ani NPM/Yarn nejsou požadovány, protože ve vlastním prostředí nelze frontend sestavit (je potřeba
 přístup přes token k privátnímu npm registru pro [FontAwesome PRO](https://fontawesome.com/)). Místo toho zde použijeme 
 automaticky sestavenou poslední produkční verzi frontendu z integračního serveru (která se automaticky nahrává do assetů ke každému release).
 
</a>

### Instalace
Nejdříve **naklonujeme repozitář**, otevřeme jeho složku a nahrajeme si **poslední produkční verzi** repozitáře
```bash
$ git clone "https://github.com/rodlukas/UP-admin.git" && cd UP-admin

$ git fetch --tags
$ latestRelease=$(git describe --tags `git rev-list --tags --max-count=1`)
$ git checkout $latestRelease
```
Stáhneme již **sestavené zdrojové kódy frontendu** z poslední produkční verze a **rozbalíme** je přímo do repozitáře (a *zip* smažeme)
```bash
$ wget https://github.com/rodlukas/UP-admin/releases/latest/download/frontend.zip
$ unzip frontend.zip && rm frontend.zip
```
**Přejmenujeme výchozí konfigurační soubor `.env.default` v kořenovém adresáři na `.env`**
```bash
$ mv .env.default .env
```
Spustíme ***psql CLI***, kde pomocí tří příkazů **vytvoříme databázi a uživatele** pro přístup do databáze, na závěr ukončíme CLI
```
$ sudo -u postgres psql

postgres=# CREATE DATABASE up;
postgres=# CREATE USER up WITH ENCRYPTED PASSWORD 'up';
postgres=# GRANT ALL PRIVILEGES ON DATABASE up TO up;
postgres=# exit
```
Nahrajeme **český balíček pro databázi** (kvůli českému řazení podle abecedy)
```bash
$ source scripts/postgresql_cs.sh
```
Nainstalujeme všechny **závislosti pro backend** a aktivujeme virtuální prostředí Pythonu
```bash
$ pipenv install --dev
$ pipenv shell
```
**Připravíme celou Django aplikaci na spuštění**
```bash
$ source scripts/release_tasks.sh
```
A vytvoříme **uživatelský účet pro přístup do aplikace** (zadáme libovolné údaje, kterými se poté budeme přihlašovat)
```bash
python manage.py createsuperuser
```
### Spuštění
**Spustíme vývojový server** 🚀
```bash
$ python manage.py runserver 0.0.0.0:8000
```
**✅ Aplikace je nyní dostupná na adrese http://localhost:8000/**

> **Poznámka: otevření aplikace na jiném zařízení v síti**
>
> Aplikace je připravena také na zobrazení z dalších zařízeních v síti (např. z mobilního telefonu). 
Obvykle je potřeba provést tyto 2 kroky:
> 1. povolit Python a Node.js ve firewallu (např. na chvíli aktivovat interaktivní režim ESETu),
> 2. na mobilním zařízení zadat privátní IP adresu počítače, na kterém běží server
## Licence
Licencováno pod [MIT](LICENSE).

Copyright (c) 2019 [Lukáš Rod](https://lukasrod.cz/)
