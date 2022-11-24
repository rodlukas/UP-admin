<p align="center">
    <img src="./admin/static/admin/android-chrome-192x192.png" alt="ÚPadmin logo" width="72">
</p>

<h3 align="center">ÚPadmin</h1>

<p align="center">
    Webová aplikace pro projekt <strong><a href="https://uspesnyprvnacek.cz/">Úspěšný prvňáček</a></strong>.
</p>

<p align="center">
    Read this in other languages: <strong><a href="README.md">English</a></strong>, <strong><a href="README.cs.md">Czech</a></strong>.
</p>

<p align="center">
    <a href="https://github.com/rodlukas/UP-admin/actions/workflows/test.yml"><img alt="GitHub Actions" src="https://github.com/rodlukas/UP-admin/actions/workflows/test.yml/badge.svg"></a>
    <a href="https://codecov.io/gh/rodlukas/UP-admin"><img alt="Codecov" src="https://img.shields.io/codecov/c/gh/rodlukas/UP-admin.svg?style=flat-square"></a>
    <a href="LICENSE"><img alt="GitHub license" src="https://img.shields.io/github/license/rodlukas/UP-admin.svg?style=flat-square"></a>
    <a href="https://github.com/rodlukas/UP-admin/releases/latest"><img alt="GitHub release" src="https://img.shields.io/github/release/rodlukas/UP-admin.svg?style=flat-square"></a>
    <a href="https://github.com/rodlukas/UP-admin/releases/latest"><img alt="GitHub commits since latest release" src="https://img.shields.io/github/commits-since/rodlukas/UP-admin/latest.svg?style=flat-square"></a>
    <br>
    <a href="https://github.com/rodlukas/UP-admin/actions/workflows/codeql.yml"><img alt="GitHub CodeQL" src="https://github.com/rodlukas/UP-admin/actions/workflows/codeql.yml/badge.svg"></a>
    <a href="https://observatory.mozilla.org/analyze/uspesnyprvnacek.herokuapp.com"><img alt="Mozilla HTTP Observatory Grade" src="https://img.shields.io/mozilla-observatory/grade-score/uspesnyprvnacek.herokuapp.com?publish&style=flat-square"></a>
    <a href="https://sonarcloud.io/dashboard?id=rodlukas_UP-admin"><img alt="Sonar Quality Gate" src="https://img.shields.io/sonar/quality_gate/rodlukas_UP-admin?server=https%3A%2F%2Fsonarcloud.io&style=flat-square"></a>
    <br>
    <a href="https://deepscan.io/dashboard#view=project&tid=8194&pid=10346&bid=141965"><img src="https://deepscan.io/api/teams/8194/projects/10346/branches/141965/badge/grade.svg" alt="DeepScan grade"></a>
    <a href="https://codebeat.co/projects/github-com-rodlukas-up-admin-master"><img alt="codebeat badge" src="https://codebeat.co/badges/7ee3ee4d-8e68-4088-8ccd-7a0e57e71a9e" /></a>
    <br>
    <a href="https://stackshare.io/rodlukas/upadmin"><img alt="StackShare" src="http://img.shields.io/badge/tech-stack-0690fa.svg?style=flat-square"></a>
    <a href="https://github.com/prettier/prettier"><img alt="Code style (js): prettier" src="https://img.shields.io/badge/code_style_(js)-prettier-ff69b4.svg?style=flat-square"></a>
    <a href="https://github.com/psf/black"><img alt="Code style (python): black" src="https://img.shields.io/badge/code_style_(python)-black-000000.svg?style=flat-square"></a>
    <br>
    <a href="https://uspesnyprvnacek.herokuapp.com/"><img alt="GitHub deployments" src="https://img.shields.io/github/deployments/rodlukas/UP-admin/uspesnyprvnacek?label=deploy%20%28production%29&style=flat-square"></a>
    <a href="https://up-admin.fly.dev/"><img alt="GitHub deployments" src="https://img.shields.io/github/deployments/rodlukas/UP-admin/uspesnyprvnacek-testing?label=deploy%20%28testing%29&style=flat-square"></a>
    <a href="https://uspesnyprvnacek-demo.herokuapp.com/"><img alt="GitHub deployments" src="https://img.shields.io/github/deployments/rodlukas/UP-admin/uspesnyprvnacek-demo?label=deploy%20%28demo%29&style=flat-square"></a>
</p>

<p align="center">
    <a href="https://sentry.io/organizations/rodlukas/issues/?project=1247206">Sentry</a> · 
    <a href="https://dashboard.heroku.com/apps">Heroku</a> · 
    <a href="https://uspesnyprvnacek.slack.com/messages">Slack</a> · 
    <a href="https://www.deepcode.ai/">DeepCode</a> · 
    <a href="https://analytics.google.com/analytics/web/#/report-home/a53235943w186065128p183124243">Google Analytics</a> · 
    Logentries – 
    <a href="https://addons-sso.heroku.com/apps/20c2c1b9-7573-42c9-ba22-cfdc7568f1f9/addons/551eb689-3908-4088-9100-519dfb42e836">produkce</a> / 
    <a href="https://addons-sso.heroku.com/apps/20090cc9-a6a5-46f4-b6ff-516a1bb9ebf3/addons/398b1cfa-4aa4-499a-a3cd-300f2093c4b3">testing</a> / 
    <a href="https://addons-sso.heroku.com/apps/312b2926-0bff-425b-9902-f71c8b8d223b/addons/43ad6f0f-a3b8-4551-81b5-5aced9b9b143">demo</a>
</p>

## Obsah

-   [Demo](#demo)
-   [Základní informace o aplikaci](#základní-informace-o-aplikaci)
    -   [Klíčové funkce](#klíčové-funkce)
    -   [Použité technologie](#použité-technologie)
        -   [Backend](#backend)
        -   [Frontend](#frontend)
    -   [Nasazené aplikace a nástroje](#nasazené-aplikace-a-nástroje)
-   [Struktura repozitáře](#struktura-repozitáře)
-   [Spuštění aplikace](#spuštění-aplikace)
    -   [Požadavky](#požadavky)
    -   [Instalace](#instalace)
    -   [Spuštění](#spuštění)
    -   [Testování](#testování)
-   [Screenshoty](#screenshoty)
-   [Licence](#licence)

## Demo

[**Nasazená demo verze aplikace na Heroku**](https://uspesnyprvnacek-demo.herokuapp.com/) – údaje
pro přihlášení: už. jméno `test` / heslo `test`.

> Aplikace po 30 minutách neaktivity usíná a chvíli trvá, než se probudí. Databáze v demo verzi je
> každou noc (2:00 UTC) **automaticky smazána** a naplněna
> [vzorovými daty](scripts/sql/sample_data.pgsql).

## Základní informace o aplikaci

Webová aplikace pro projekt **[Úspěšný prvňáček](https://uspesnyprvnacek.cz/)** (mrkněte na
[jeho stránky](https://uspesnyprvnacek.cz/), také pochází z mé tvorby) – založená na technologiích
React (TypeScript), Django (Python), REST API, Django REST Framework.

Aplikaci jsem vytvořil v roce 2018 jako **bakalářskou práci na [FIT ČVUT](https://fit.cvut.cz/cs)**
– vizte [repozitář s textem bakalářské práce](https://github.com/rodlukas/bachelors-thesis). Od té
doby je v projektu [Úspěšný prvňáček](https://uspesnyprvnacek.cz/) denně úspěšně používána a její
rozšiřování a práce na ní stále pokračují ❤️. V roce 2020 jsem se také v **diplomové práci na FIT
ČVUT** věnoval všem dosavadním rozšířením aplikace o nové funkce, technologie a nástroje – vizte
[repozitář s textem diplomové práce](https://github.com/rodlukas/masters-thesis). A vývoj probíhá i
nadále.

### Klíčové funkce

V následujícím seznamu jsou nejdůležitější funkce, která aplikace poskytuje (výčet není konečný):

-   **evidence klientů a skupin klientů docházejících na lekce kurzů**,
-   **evidence lekcí klientů a skupin včetně předplacených – stav účasti, platba, datum, čas,
    zrušení, poznámky**,
-   **evidence zájemců o kurzy**,
-   **zobrazení lekcí ve 3 formách: v kartě klienta/skupiny, v diáři a na hlavní stránce v přehledu
    pro dnešní den**,
-   kontrola časových konfliktů lekcí,
-   automatické rušení lekcí když nikdo nemá přijít,
-   automatické vytváření předplacených náhrad lekcí při omluvě předem/zrušení ze strany lektorky,
-   upozornění, že má klient příště platit,
-   výpočet pořadového čísla lekce s ohledem na účast klientů,
-   vyhledávání klientů (fuzzy vyhledávání)
-   konfigurace kurzů a stavů účasti včetně např. intuitivního nastavení zvolené barvy pro kurz,
-   propojení s API _Fio banky_ – na hlavní stránce se přehledně zobrazují nedávné transakce z účtu,
-   automatický odhad kurzu, data a času pro nově přidávané lekce,
-   respektování a kontrola všech omezení daných danou doménou (např. duplicity),
-   vedení aktivních a neaktivních klientů a skupin.

### Použité technologie

Aplikace je rozdělena na **frontend a backend**, ty spolu komunikují přes **REST API** zabezpečené
**[JWT](https://jwt.io/) autentizací**. Jako databáze se používá
[PostgreSQL 12](https://www.postgresql.org/).

> **Poznámka:** součástí repozitáře je také diagram nasazení a logický datový model – viz
> [`docs/README.md`](docs).

#### Backend

Obsahuje veškerou logiku a pro klienta vystavuje **REST API**, postaven na těchto technologiích:

-   [Python 3.10](https://www.python.org/),
-   [Django 3](https://www.djangoproject.com/),
-   [Django REST framework 3](https://www.django-rest-framework.org/),
-   [djangorestframework-simplejwt](https://github.com/davesque/django-rest-framework-simplejwt),
-   [a další...](/Pipfile)

V Djangu jsou pro mnohonásobné zrychlení pokročile **optimalizované komplexní SQL dotazy** (viz
články [[1]](https://www.revsys.com/tidbits/django-performance-simple-things/),
[[2]](http://ses4j.github.io/2015/11/23/optimizing-slow-django-rest-framework-performance/)).
Aplikace umožňuje **pokročilé debugování** na lokálním i vzdáleném prostředí díky
**[Django Debug Toolbar](https://github.com/jazzband/django-debug-toolbar)** a jeho doplňku
[Django Debug Toolbar Request History](https://github.com/djsutho/django-debug-toolbar-request-history/).

Pro **statickou typovou kontrolu** se napříč celým kódem používají typové anotace s použitím modulu
[typing](https://docs.python.org/3/library/typing.html), pro kontrolu typů se používá
**[mypy](http://mypy-lang.org/)** a [Pycharm](https://www.jetbrains.com/pycharm/). Pro **eliminaci
mrtvého kódu** se také používá **[vulture](https://github.com/jendrikseipp/vulture/)**.

#### Frontend

Responzivní JS _([TypeScript](https://www.typescriptlang.org/))_ webová aplikace typu SPA
([Single-Page-App](https://en.wikipedia.org/wiki/Single-page_application)) postavená na těchto
technologiích:

-   [React 17](https://reactjs.org/),
-   [TypeScript 4](https://www.typescriptlang.org/),
-   [Bootstrap 4](https://getbootstrap.com/) (s [Reactstrap](https://reactstrap.github.io/)em),
-   [React Router 5](https://reacttraining.com/react-router/),
-   [FontAwesome 5 PRO](https://fontawesome.com/) (publikované do privátních Github Package
    Registry)
-   [a další...](/frontend/package.json)

Vývoj frontendu je postaven především na:

-   [Webpack 5](https://webpack.js.org/) s vlastní konfigurací (lokální i produkční) +
    [Webpack DevServer](https://webpack.js.org/configuration/dev-server/),
-   [Babel 7](https://babeljs.io/),
-   [Typescript 4](https://www.typescriptlang.org/) – pro statickou typovou kontrolu,
-   [ESlint 8](https://eslint.org/) a [stylelint](https://stylelint.io/) – lintery pro statickou
    analýzu kódu,
-   [husky](https://github.com/typicode/husky) a
    [lint-staged](https://github.com/okonet/lint-staged) – pre-commit kontroly (eslint, stylelint)
-   a [React Hot Loader](https://github.com/gaearon/react-hot-loader) – pro
    [HMR](https://webpack.js.org/guides/hot-module-replacement/).

Aplikace je **odolná proti pádům JS** díky
**[React Error Boundaries](https://reactjs.org/docs/error-boundaries.html)**. Pro **zrychlení
načítání** celé aplikace se používá lazy loading
**[`React.lazy` + `React Suspense`](https://reactjs.org/docs/code-splitting.html)**.
[Webpack DevServer](https://webpack.js.org/configuration/dev-server/) je při vývoji propojený s
[Django](https://www.djangoproject.com/) dev serverem a umožňuje tak jednoduchý vývoj bez kompromisů
včetně [HMR](https://webpack.js.org/guides/hot-module-replacement/). Globální stav aplikace je
spravován přes **[React Context](https://reactjs.org/docs/context.html)**. Část codebase využívá
také výhod **[React Hooks](https://reactjs.org/docs/hooks-intro.html)**.

### Nasazené aplikace a nástroje

Aplikace je nasazena do **4 prostředí na PaaS [Heroku](https://www.heroku.com/)**, které se liší
příslušnou nasazenou verzí aplikace, konkrétní instancí databáze a umožňují různé úrovně debugování.
Mimo to lze samozřejmě aplikaci spustit i v prostředí lokálním u vývojáře. Typ prostředí je také
zvýrazněn barevným štítkem v horním menu (kromě produkce).

> **Seznam prostředí:**
>
> -   **lokální** – pro lokální vývoj,
> -   **testing** – stejná konfigurace jako na produkci, deploy při každém commitu; umožňuje zapnout
>     debugování,
> -   **produkce** – produkční verze používaná zákazníkem, deploy při release,
> -   [**demo**](https://uspesnyprvnacek-demo.herokuapp.com/) – demo verze aplikace, manuální deploy
>     z větve `demo`.

-   Nasazené aplikace jsou **HTTPS-only** (+ pokročilé zabezpečení, viz
    [[1]](https://docs.djangoproject.com/en/2.0/howto/deployment/checklist/),
    [[2]](https://wsvincent.com/django-best-practices/)).
-   Na produkci se každý den ve 3:00 provádí
    [automatická záloha databáze](https://devcenter.heroku.com/articles/heroku-postgres-backups#scheduling-backups).
-   Pro **automatické formátování kódů** se používá **[Black](https://github.com/psf/black)**
    (Python) a **[Prettier](https://prettier.io/)** (TS, TSX, JS, CSS, HTML, JSON, YAML, TOML, MD),
    oba nástroje jsou napojené na IDE a provádějí automatické úpravy.
-   **Aplikace jsou napojené na další služby:**
    -   **CI a CD** má na starost [GitHub Actions](https://github.com/features/actions) –
        automatizovaný build, testování i nasazení na různá prostředí, automaticky prováděné
        pokročilejší skripty např. pro automatické zapsání verze do aplikace, práci s tokeny,
        nahrání sestaveného frontendu do assetů k releasu na GitHubu, napojení na služby pro výpočet
        pokrytí kódu a další.
    -   **Automatickou průběžnou analýzu a kontrolu kódu** včetně hodnocení kvality kódu, hledání
        potenciálních chyb a zranitelností má na starost
        [GitHub CodeQL](https://codeql.github.com/), [SonarCloud](https://sonarcloud.io/) a
        [DeepScan](https://deepscan.io/).
    -   **Logování** z Heroku se zasílá do [Logentries](https://logentries.com/) (logy se uchovávají
        po 7 dnů, tříděné podle typu prostředí).
    -   **Odchytávání chyb na backendu i frontendu** včetně následné evidence, notifikací a
        propojení s repozitářem zařizuje [Sentry](https://sentry.io/) (tříděné podle typu prostředí,
        aktivní na všech nasazených aplikacích). Při chybě na frontendu je možné poslat **zpětnou
        vazbu vázanou ke konkrétní chybě** díky propojení Sentry a
        [React Error Boundaries](https://reactjs.org/docs/error-boundaries.html).
    -   **Sledování toku uživatelů** umožňuje napojení na
        [Google Analytics](https://analytics.google.com/) (přes modul
        [react-ga](https://github.com/react-ga/react-ga)).
    -   [Slack](https://slack.com/)
-   [audit-ci](https://github.com/IBM/audit-ci) se používá pro automatizovanou kontrolu zranitelných
    závislostí projektu na CI.
-   Aplikace **respektuje standardy** [PEP 8](https://pep8.org),
    [12-Factor App](https://12factor.net/), [ROCA](https://roca-style.org/).
-   Kompletní vývoj aplikace probíhá v IDE
    _[Pycharm (Professional Edition)](https://www.jetbrains.com/pycharm/)_ (řeší automatickou
    optimalizaci importů, automatické formátování kódů apod.).
-   **Rozsáhlé testy API i UI (E2E)** jsou důležitou částí aplikace, automaticky se spouští na CI a
    lze je spustit i na lokálním prostředí. Část frontendu je navíc pokryta **unit testy**.
    -   E2E testování je postaveno na **BDD frameworku [behave](https://github.com/behave/behave)**
        – testové scénáře jsou psány přirozeným jazykem (Gherkin), podle nich se spouští konkrétní
        testy.
    -   Unit testy jsou postaveny na **frameworku [Jest](https://jestjs.io/)** a nástrojích
        **[React Testing Library](https://testing-library.com/docs/react-testing-library/intro)**
        (jednoduché utility pro testování Reactu),
        [jest-dom](https://testing-library.com/docs/ecosystem-jest-dom) (custom DOM element matchers
        pro Jest) a [MSW](https://mswjs.io/) (mockování API).
    -   Pro **testování UI (E2E)** se používá [Selenium](https://github.com/SeleniumHQ/selenium).
    -   **Podrobné informace o testech jsou v [`tests/README.md`](tests)**.

## Struktura repozitáře

```
├── .idea ........ nastavení pro IDE (Pycharm od Jetbrains)
├── admin ........ Django aplikace pro webovou aplikaci
├── api .......... Django aplikace pro REST API
├── docs ......... další dokumentace a soubory k aplikaci včetně diagramů
├── frontend ..... klientská část webové aplikace
├── scripts ...... skripty pro CI/CD/PaaS/instalaci
├── staticfiles .. složka pro statické soubory (prázdná, přesun až na CI)
├── tests ........ testy API i UI (e2e)
└── up ........... celý Django projekt
```

## Spuštění aplikace

Aplikaci lze spustit na lokálním prostředí ve dvou režimech. Výchozí re6im je klasický vývojový –
ten obsahuje pokročilé debugovací nástroje, spouští se Django vývojový server a také
webpack-dev-server pro frontend. Vzhledem k práci s privátními GitHub Package registry (viz
[níže](#npmpro)) nelze samozřejmě bez příslušných tokenů sestavovat frontend, proto zde budu
popisovat postup spuštění ve druhém režimu – **manuální produkční verze aplikace**, tedy ta, která
je nejblíže verzi u zákazníka.

### Požadavky

Minimální požadavky na nástroje nainstalované v cílovém OS:

-   [Python 3](https://www.python.org/downloads/) (konkrétní verze viz [`Pipfile`](/Pipfile)),
-   [Pipenv](https://pipenv.pypa.io/en/latest/#install-pipenv-today),
-   [Git](https://git-scm.com/downloads),
-   [PostgreSQL 12](https://www.postgresql.org/download/).

<a name="npmpro">
  
> **Poznámka:** Node.js ani npm nejsou požadovány, protože ve vlastním prostředí nelze frontend sestavit (je potřeba
 přístup přes token k privátnímu GitHub Package registru pro [FontAwesome PRO](https://fontawesome.com/)). Místo toho zde použijeme 
 automaticky sestavenou poslední produkční verzi frontendu z integračního serveru (která se automaticky nahrává do assetů ke každému release).
 
</a>

### Instalace

Pokud už požadavky výše splňujete, můžeme se vrhnout na instalaci:

1.  Nejdříve **naklonujeme repozitář**, otevřeme jeho složku a nahrajeme si **poslední produkční
    verzi** repozitáře:

    ```bash
    git clone "https://github.com/rodlukas/UP-admin.git" && cd UP-admin
    git checkout $(git describe --tags `git rev-list --tags --max-count=1`)
    ```

2.  Stáhneme již **sestavené zdrojové kódy frontendu** z poslední produkční verze a **rozbalíme** je
    přímo do repozitáře (a `frontend.zip` smažeme):

    ```bash
    wget https://github.com/rodlukas/UP-admin/releases/latest/download/frontend.zip
    unzip frontend.zip && rm frontend.zip
    ```

3.  **Přejmenujeme vzorový konfigurační soubor `.env.template`** v kořenovém adresáři na **`.env`**:

    ```bash
    mv .env.template .env
    ```

4.  Pomocí **[_psql CLI_](https://www.postgresql.org/docs/current/app-psql.html)** **vytvoříme
    databázi a uživatele** pro přístup do databáze:

    ```bash
    sudo -u postgres psql -c "CREATE USER up WITH ENCRYPTED PASSWORD 'up';" -c "CREATE DATABASE up WITH OWNER up;"
    ```

5.  Nahrajeme **český balíček pro databázi** (kvůli českému řazení podle abecedy):

    ```bash
    source scripts/shell/postgresql_cs.sh
    ```

6.  Nainstalujeme všechny **závislosti pro backend** a aktivujeme virtuální prostředí Pythonu:

    ```bash
    pipenv install --dev
    pipenv shell
    ```

7.  **Připravíme celou Django aplikaci na spuštění** ([skript](scripts/shell/release_tasks.sh)
    nastaví výchozí soubor s nastavením Djanga, připraví statické soubory frontendu a vytvoří
    databázové schéma):

    ```bash
    source scripts/shell/release_tasks.sh
    ```

8.  A vytvoříme **uživatelský účet pro přístup do aplikace** (zadáme libovolné údaje, kterými se
    poté budeme přihlašovat):

    ```bash
    python manage.py createsuperuser
    ```

9.  💡 _(NEPOVINNÉ)_ Na závěr můžeme ještě **naplnit naší databázi
    [předpřipravenými vzorovými daty](scripts/sql/sample_data.pgsql)**, která ukážou fungování
    aplikace a usnadní první použití (obsahují několik klientů, skupin, lekcí, zájemců, kurzů a
    stavů účasti) – po zadání příkazu je vyžadováno heslo databázového uživatele `up`, které jsme
    nastavili taktéž `up`:

    ```bash
    psql --dbname up -h localhost -U up -f scripts/sql/sample_data.pgsql
    ```

### Spuštění

**Spustíme vývojový server** 🚀:

```bash
python manage.py runserver 0.0.0.0:8000
```

**✅ Aplikace je nyní dostupná na adrese <http://localhost:8000/>.**

> **Poznámka: otevření aplikace na jiném zařízení v síti** – aplikace je připravena pro použití i z
> dalších zařízeních v síti (např. z mobilního telefonu), obvykle je potřeba provést tyto 2 kroky:
>
> 1.  povolit Python a Node.js ve firewallu (např. na chvíli aktivovat interaktivní režim ESETu),
> 2.  na mobilním zařízení zadat hostname nebo privátní IP adresu počítače, na kterém běží server.

### Testování

Můžeme také snadno spustit různé testy aplikace, například otestovat, jestli správně funguje API pro
klienty:

```bash
python manage.py behave --stage=api --tags=clients
```

Aplikace obsahuje **rozsáhlé API a UI (e2e) testy** – vizte
[podrobné informace o testech a možnostech spouštění](tests).

## Screenshoty

> **Poznámka:** údaje v aplikaci jsou smyšlené.

### Diář

[![screenshot z diáře](docs/screenshots/diary.png)](https://raw.githubusercontent.com/rodlukas/UP-admin/master/docs/screenshots/diary.png)

### Přehled (hlavní stránka)

[![screenshot z přehledu](docs/screenshots/dashboard.png)](https://raw.githubusercontent.com/rodlukas/UP-admin/master/docs/screenshots/dashboard.png)

### Karta klienta / skupiny

[![screenshot z karty klienta](docs/screenshots/card-client.png)](https://raw.githubusercontent.com/rodlukas/UP-admin/master/docs/screenshots/card-client.png)

[![screenshot z karty skupiny](docs/screenshots/card-group.png)](https://raw.githubusercontent.com/rodlukas/UP-admin/master/docs/screenshots/card-group.png)

### Zájemci o kurzy

[![screenshot ze zájemců o kurzy](docs/screenshots/applications.png)](https://raw.githubusercontent.com/rodlukas/UP-admin/master/docs/screenshots/applications.png)

### Nastavení

[![screenshot z nastavení](docs/screenshots/settings.png)](https://raw.githubusercontent.com/rodlukas/UP-admin/master/docs/screenshots/settings.png)

### Formuláře

#### Úprava skupinové lekce

[![screenshot formuláře pro úpravu skupinové lekce](docs/screenshots/form-lecture.png)](https://raw.githubusercontent.com/rodlukas/UP-admin/master/docs/screenshots/form-lecture.png)

#### Úprava údajů o skupině

[![screenshot formuláře pro úpravu údajů o skupině](docs/screenshots/form-group.png)](https://raw.githubusercontent.com/rodlukas/UP-admin/master/docs/screenshots/form-group.png)

## Historie

-   Projekt původně pro CI & CD používal [Travis](https://travis-ci.com/), ale v listopadu 2022
    došlo k migraci na GitHub Actions.
-   Automatickou průběžnou analýzu a kontrolu kódu zajišťoval mj. [LGTM](https://lgtm.com/) až do
    listopadu 2022, kdy byl nahrazen svým nástupcem [GitHub CodeQL](https://codeql.github.com/).

## Licence

Licencováno pod [MIT](LICENSE) licencí.

Copyright (c) 2018–2022 [Lukáš Rod](https://lukasrod.cz/)
