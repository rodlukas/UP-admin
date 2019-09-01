<p align="center">
  <img src="./admin/static/admin/android-chrome-192x192.png" alt="ÚPadmin logo" width="72">
</p>

<h3 align="center">ÚPadmin</h1>

<p align="center">
  Webová aplikace pro projekt <strong><a href="https://uspesnyprvnacek.cz/">Úspěšný prvňáček</a></strong>.
</p>

<p align="center">
  <a href="https://travis-ci.com/rodlukas/UP-admin"><img alt="Travis (.com)" src="https://img.shields.io/travis/com/rodlukas/UP-admin.svg?style=flat-square"></a>
  <a href="https://codecov.io/gh/rodlukas/UP-admin"><img alt="Codecov" src="https://img.shields.io/codecov/c/gh/rodlukas/UP-admin.svg?style=flat-square"></a>
  <a href="LICENSE"><img alt="GitHub license" src="https://img.shields.io/github/license/rodlukas/UP-admin.svg?style=flat-square"></a>
  <a href="https://github.com/rodlukas/UP-admin/releases/latest"><img alt="GitHub release" src="https://img.shields.io/github/release/rodlukas/UP-admin.svg?style=flat-square"></a>
  <a href="https://github.com/rodlukas/UP-admin/releases/latest"><img alt="GitHub commits since latest release" src="https://img.shields.io/github/commits-since/rodlukas/UP-admin/latest.svg?style=flat-square"></a>
  <br>
  <a href="https://lgtm.com/projects/g/rodlukas/UP-admin/alerts/"><img alt="LGTM Alerts" src="https://img.shields.io/lgtm/alerts/github/rodlukas/UP-admin.svg?style=flat-square"></a>
  <a href="https://lgtm.com/projects/g/rodlukas/UP-admin/context:javascript"><img alt="LGTM Grade" src="https://img.shields.io/lgtm/grade/javascript/github/rodlukas/UP-admin.svg?style=flat-square"></a>
  <a href="https://lgtm.com/projects/g/rodlukas/UP-admin/context:python"><img alt="LGTM Grade" src="https://img.shields.io/lgtm/grade/python/github/rodlukas/UP-admin.svg?style=flat-square"></a>
  <br>
  <a href="https://github.com/prettier/prettier"><img alt="Code style (js): prettier" src="https://img.shields.io/badge/code_style_(js)-prettier-ff69b4.svg?style=flat-square"></a>
  <a href="https://github.com/psf/black"><img alt="Code style (python): black" src="https://img.shields.io/badge/code_style_(python)-black-000000.svg?style=flat-square"></a>
</p>

<p align="center">
  <a href="https://sentry.io/uspesnyprvnacek/up-admin/">Sentry</a> · 
  <a href="https://dashboard.heroku.com/apps">Heroku</a> · 
  <a href="https://uspesnyprvnacek.slack.com/messages">Slack</a> · 
  <a href="https://analytics.google.com/analytics/web/#/report-home/a53235943w186065128p183124243">Google Analytics</a> · 
  Logentries – 
  <a href="https://addons-sso.heroku.com/apps/20c2c1b9-7573-42c9-ba22-cfdc7568f1f9/addons/551eb689-3908-4088-9100-519dfb42e836">produkce</a> / 
  <a href="https://addons-sso.heroku.com/apps/e3a9ca55-ccff-46ec-b37f-99ce57c75ee1/addons/f32bd464-be5c-4a70-bdbd-ca4b1c925803">staging</a> / 
  <a href="https://addons-sso.heroku.com/apps/20090cc9-a6a5-46f4-b6ff-516a1bb9ebf3/addons/398b1cfa-4aa4-499a-a3cd-300f2093c4b3">testing</a>
</p>

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
   * [Testování](#testování)
* [Screenshoty z aplikace](#screenshoty-z-aplikace)
* [Licence](#licence)

## Základní informace o aplikaci
Aplikaci jsem vytvořil v roce 2018 v rámci **bakalářské práce na FIT ČVUT** – vizte [repozitář s textem práce](https://github.com/rodlukas/bachelors-thesis).
Od té doby je v projektu [Úspěšný prvňáček](https://uspesnyprvnacek.cz/) denně úspěšně používána a její rozšiřování a práce na ní stále pokračují ❤️.
### Klíčové funkce aplikace
* **evidence klientů a skupin klientů docházejících na lekce kurzů**
* **evidence lekcí klientů a skupin včetně předplacených – stav účasti, platba, datum, čas, zrušení, poznámky**
* **evidence zájemců o kurzy**
* **zobrazení lekcí ve 3 formách: v kartě klienta/skupiny, v diáři a na hlavní stránce v přehledu pro dnešní den**
* kontrola časových konfliktů lekcí
* automatické rušení lekcí když nikdo nemá přijít
* automatické vytváření předplacených náhrad lekcí při omluvě předem
* upozornění, že má klient příště platit
* konfigurace kurzů a stavů účasti včetně např. intuitivního nastavení zvolené barvy pro kurz
* propojení s API *Fio banky* – na hlavní stránce se přehledně zobrazují nedávné transakce z účtu
* automatický odhad kurzu pro nově přidávané lekce
* respektování a kontrola všech omezení daných danou doménou (např. duplicity apod.)
* automatické přidání předplacené lekce při omluvě/zrušení lekce ze strany lektorky
* funkce pro vedení aktivních a neaktivních klientů a skupin
* *... (výčet není konečný)*
### Použité technologie
Aplikace je rozdělena na **frontend a backend**, ty spolu komunikují přes **REST API** zabezpečené **[JWT](https://jwt.io/) autentizací**.
Jako databáze se používá [PostgreSQL 11](https://www.postgresql.org/).

> **Poznámka:** součástí repozitáře je také diagram nasazení a logický datový model – viz [`docs/README.md`](docs).

#### Backend
Obsahuje veškerou logiku a pro klienta vystavuje **REST API**, postaven na těchto technologiích:
* [Python 3.7](https://www.python.org/),
* [Django 2](https://www.djangoproject.com/),
* [Django REST framework 3](https://www.django-rest-framework.org/),
* [djangorestframework-simplejwt](https://github.com/davesque/django-rest-framework-simplejwt),
* [a další...](/Pipfile)

V Djangu jsou pro mnohonásobné zrychlení pokročile **optimalizované komplexní SQL dotazy** (viz články [[1]](https://www.revsys.com/tidbits/django-performance-simple-things/), [[2]](http://ses4j.github.io/2015/11/23/optimizing-slow-django-rest-framework-performance/)).
Aplikace umožňuje **pokročilé debugování** na lokálním i vzdáleném prostředí díky **[Django Debug Toolbar](https://github.com/jazzband/django-debug-toolbar)** a jeho doplňku [Django Debug Toolbar Request History](https://github.com/djsutho/django-debug-toolbar-request-history/).
#### Frontend
Responzivní JS *(ES2018)* webová aplikace typu SPA ([Single-Page-App](https://en.wikipedia.org/wiki/Single-page_application)) postavená na těchto technologiích:
* [React 16.8](https://reactjs.org/),
* [Bootstrap 4](https://getbootstrap.com/) (s [Reactstrap](https://reactstrap.github.io/)em),
* [React Router 4](https://reacttraining.com/react-router/),
* [a další...](/frontend/package.json)

Aplikace je **odolná proti pádům JS** díky **[React Error Boundaries](https://reactjs.org/docs/error-boundaries.html)**.
Pro **zrychlení načítání** celé aplikace se používá lazy loading **[`React.lazy` + `React Suspense`](https://reactjs.org/docs/code-splitting.html)**.
**Statickou typovou kontrolu** má na starost **[Flow](https://flow.org/)**.
### Informace o nasazených aplikacích
Aplikace aktuálně běží na **4 prostředích** (3x PaaS [Heroku](https://www.heroku.com/)), které se liší příslušnou nasazenou verzí aplikace, 
konkrétní instancí databáze, umožňují různé úrovně debugování a kosmeticky se liší také barvou menu. 

> **Seznam prostředí:**
> * **vývojové (lokální)** – pro lokální vývoj *(žluté menu)*,
> * **testing** – umožňuje zapnout debugování, deploy každého commitu *(modré menu)*,
> * **staging** – stejná verze aplikace jako na produkci, deploy při release *(zelené menu)*,
> * **produkce** – produkční verze používaná zákazníkem, deploy při release (jako staging) *(bílé menu)*.

* Nasazené aplikace jsou **HTTPS-only** (+ pokročilé zabezpečení, 
viz [[1]](https://docs.djangoproject.com/en/2.0/howto/deployment/checklist/), [[2]](https://wsvincent.com/django-best-practices/)).
* Na produkci se každý den ve 3:00 provádí 
[automatická záloha databáze](https://devcenter.heroku.com/articles/heroku-postgres-backups#scheduling-backups).
* Pro **automatické formátování kódů** se používá **[Black](https://github.com/psf/black)** (Python) a **[Prettier](https://prettier.io/)** (JS, JSX, CSS, HTML), oba nástroje jsou napojené na IDE a provádějí automatické úpravy.
* **Aplikace jsou napojené na další služby:**
    * **CI a CD** má na starost [Travis](https://travis-ci.com/) – automatizovaný build, testování i nasazení na různá prostředí, automaticky prováděné pokročilejší skripty např. pro automatické zapsání verze do aplikace, práci s tokeny, nahrání sestaveného frontendu do assetů k releasu na GitHubu, napojení na služby pro výpočet pokrytí kódu a další.
    * **Automatickou průběžnou analýzu a kontrolu kódu** včetně hodnocení kvality kódu, hledání potenciálních chyb a 
    zranitelností má na starost [LGTM](https://lgtm.com/).
    * **Logování** z Heroku se zasílá do [Logentries](https://logentries.com/) (logy se uchovávají po 7 dnů, tříděné 
    podle typu prostředí).
    * **Odchytávání chyb na backendu i frontendu** včetně následné evidence, notifikací a propojení s repozitářem zařizuje
     [Sentry](https://sentry.io/) (tříděné podle typu prostředí, aktivní na produkci, testing i staging prostředí). 
     Při chybě na frontendu je možné poslat **zpětnou vazbu vázanou ke konkrétní chybě** díky propojení Sentry a 
     [React Error Boundaries](https://reactjs.org/docs/error-boundaries.html).
    * **Sledování chování a návštěv** umožňuje napojení na [Google Analytics](https://analytics.google.com/) (díky modulu [react-ga](https://github.com/react-ga/react-ga)).
    * [Slack](https://slack.com/)
* Aplikace **respektuje standardy** [PEP 8](https://pep8.org), [12-Factor App](https://12factor.net/), [ROCA](https://roca-style.org/).
* Kompletní vývoj aplikace probíhá v IDE *[Pycharm (Professional Edition)](https://www.jetbrains.com/pycharm/)* (řeší například automatickou optimalizaci importů, automatické formátování kódů apod.).
* Základ aplikace tvoří **rozsáhlé testy API i frontendu**, které se automaticky spouští na CI a lze je spustit i na lokálním prostředí.
    * Testování je postaveno na **BDD frameworku [behave](https://github.com/behave/behave)** – 
    testové scénáře jsou psány přirozeným jazykem, podle nich se spouští konkrétní testy.
    * Pro **testování UI** se používá [Selenium](https://github.com/SeleniumHQ/selenium).
    * **Podrobné informace o testech jsou v [`tests/README.md`](tests/)**.

## Struktura repozitáře
```bash
├── .idea ........ nastavení pro IDE (Pycharm od Jetbrains)      
├── admin ........ Django aplikace pro samotnou webovou aplikaci        
├── api .......... Django aplikace pro API
├── docs ......... další dokumenty a soubory k aplikaci včetně diagramů      
├── frontend ..... klientská část webové aplikace   
├── scripts ...... skripty pro CI/CD/instalaci
├── staticfiles .. složka pro statické soubory (prázdná, přesun až na CI)
├── tests ........ kompletní testy API i UI (frontendu)
└── up ........... celý Django projekt
```

## Jak spustit aplikaci
Aplikaci lze spustit na lokálním prostředí ve dvou režimech, výchozí je klasický vývojový – ten obsahuje pokročilé debugovací
nástroje, spouští se Django vývojový server a také webpack-dev-server pro frontend. Vzhledem k práci s privátními npm registry (viz [níže](#npmpro)) nelze samozřejmě bez příslušných tokenů sestavovat frontend, proto zde budu popisovat postup spuštění ve druhém režimu – **produkční verze aplikace**, tedy ta, která je nejblíže verzi u zákazníka.
### Požadavky
Pro spuštění je potřeba mít v OS nainstalováno:
* [Python 3.7](https://www.python.org/downloads/) (konkrétní verze viz [`Pipfile`](/Pipfile)),
* [Pipenv](https://docs.pipenv.org/en/latest/install/#installing-pipenv),
* [Git](https://git-scm.com/downloads),
* [PostgreSQL 11](https://www.postgresql.org/download/).

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
Stáhneme již **sestavené zdrojové kódy frontendu** z poslední produkční verze a **rozbalíme** je přímo do repozitáře (a `frontend.zip` smažeme)
```bash
$ wget https://github.com/rodlukas/UP-admin/releases/latest/download/frontend.zip
$ unzip frontend.zip && rm frontend.zip
```
**Přejmenujeme vzorový konfigurační soubor `.env.template` v kořenovém adresáři na `.env`**
```bash
$ mv .env.template .env
```
Spustíme ***psql CLI***, kde pomocí dvou příkazů **vytvoříme databázi a uživatele** pro přístup do databáze, na závěr ukončíme CLI
```
$ sudo -u postgres psql

postgres=# CREATE USER up WITH ENCRYPTED PASSWORD 'up';
postgres=# CREATE DATABASE up WITH OWNER up;
postgres=# exit
```
Nahrajeme **český balíček pro databázi** (kvůli českému řazení podle abecedy)
```bash
$ source scripts/shell/postgresql_cs.sh
```
Nainstalujeme všechny **závislosti pro backend** a aktivujeme virtuální prostředí Pythonu
```bash
$ pipenv install --dev
$ pipenv shell
```
**Připravíme celou Django aplikaci na spuštění** (skript nastaví výchozí soubor s nastavením Djanga, připraví statické soubory frontendu pro nasazení a vytvoří databázové schéma)
```bash
$ source scripts/shell/release_tasks.sh
```
A vytvoříme **uživatelský účet pro přístup do aplikace** (zadáme libovolné údaje, kterými se poté budeme přihlašovat)
```bash
$ python manage.py createsuperuser
```
💡 *(NEPOVINNÉ)* Na závěr můžeme ještě **naplnit naší databázi [předpřipravenými vzorovými daty](scripts/sql/sample_data.pgsql)**, která ukážou fungování aplikace a usnadní první použití 
(obsahují několik klientů, skupin, lekcí, zájemců, kurzů a stavů účasti) – po zadání příkazu je vyžadováno heslo databázového uživatele `up`, které jsme nastavili taktéž `up`
```bash
$ psql --dbname up -h localhost -U up -f scripts/sql/sample_data.pgsql
```
### Spuštění
**Spustíme vývojový server** 🚀
```bash
$ python manage.py runserver 0.0.0.0:8000
```
**✅ Aplikace je nyní dostupná na adrese http://localhost:8000/.**

> **Poznámka: otevření aplikace na jiném zařízení v síti**
>
> Aplikace je připravena také na zobrazení z dalších zařízeních v síti (např. z mobilního telefonu). 
Obvykle je potřeba provést tyto 2 kroky:
> 1. povolit Python a Node.js ve firewallu (např. na chvíli aktivovat interaktivní režim ESETu),
> 2. na mobilním zařízení zadat hostname nebo privátní IP adresu počítače, na kterém běží server.

### Testování
Můžeme také snadno spustit různé testy aplikace, například otestovat, jestli správně funguje API pro klienty
```bash
$ python manage.py behave --stage=api --tags=clients
```
Aplikace obsahuje rozsáhlé API a UI testy – vizte [podrobné informace o testech a možnostech spouštění](tests/).

## Screenshoty z aplikace
> **Poznámka:** obdelníky (převážně modré) skrývají jména klientů.

### Diář
[![screenshot z diáře](docs/screenshots/diary.png)](https://raw.githubusercontent.com/rodlukas/UP-admin/master/docs/screenshots/diary.png)
### Karta klienta
[![screenshot z karty klienta](docs/screenshots/card.png)](https://raw.githubusercontent.com/rodlukas/UP-admin/master/docs/screenshots/card.png)
### Zájemci o kurzy
[![screenshot ze zájemců o kurzy](docs/screenshots/applications.png)](https://raw.githubusercontent.com/rodlukas/UP-admin/master/docs/screenshots/applications.png)

## Licence
Licencováno pod [MIT](LICENSE).

Copyright (c) 2019 [Lukáš Rod](https://lukasrod.cz/)
