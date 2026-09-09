# AGENTS.md

Tento soubor poskytuje instrukce AI agentům při práci s kódem v tomto repozitáři.

## Příkazy

### Lokální spuštění (od nuly)

```bash
# 1. Zkopíruj a vyplň env proměnné (DATABASE_URL, SECRET_KEY, GPR_TOKEN, ...)
cp .env.template .env

# 2. Nainstaluj závislosti
pipenv install --dev          # Python závislosti
npm ci                        # Node závislosti (postinstall hook automaticky nainstaluje i frontend a buildne ho)

# 3. (Pouze při prvním spuštění native režimu) vytvoř DB kontejner postgresql_cz
source scripts/shell/postgresql_docker.sh

# 4. Spusť databázi a servery
make db                       # PostgreSQL v Docker kontejneru
make be                       # Django dev server na 0.0.0.0:8000
make fe                       # Webpack dev server na http://localhost:3000
```

**Alternativa přes Docker Compose** (spustí vše včetně DB):
```bash
docker compose up
docker compose run web python manage.py createsuperuser
```

> **FontAwesome PRO:** ikony jsou z private GitHub Package Registry — `GPR_TOKEN` v `.env` musí být nastaven i pro lokální vývoj (jinak `npm ci` selže).

### Backend (Python / Django)

```bash
# Testy a kvalita kódu
pipenv run mypy .             # typová kontrola
pipenv run python manage.py test                                      # unit testy (Django TestCase)
pipenv run python manage.py behave --stage=api --format=progress3    # E2E API testy (behave)
pipenv run python manage.py behave --stage=ui --format=progress3     # E2E UI testy (behave + Selenium)

# Coverage (kombinuje všechny testy dohromady)
pipenv run coverage run -a manage.py test
pipenv run coverage run -a manage.py behave --stage=api --format=progress3
pipenv run coverage run -a manage.py behave --stage=ui --format=progress3
pipenv run coverage report

# Migrace
pipenv run python manage.py makemigrations    # vytvoří nové migrace po změně modelů
pipenv run python manage.py migrate           # aplikuje migrace na DB
```

> **PostgreSQL je povinné i pro testy:** před `pipenv run python manage.py test` nebo `behave` nejdřív spusť DB (`make db` v native režimu, nebo `docker compose up` v compose režimu). Bez běžící PostgreSQL backend testy selžou už při inicializaci testovací databáze.

### Frontend (TypeScript / React)

```bash
# Testy a kvalita kódu (z rootu repozitáře — doporučeno pro CI paritu)
npm run frontend:test           # typy + lint + vitest (kompletní frontend CI suite)
npm run frontend:lint:js        # pouze ESLint
npm run frontend:audit          # security audit závislostí (audit-ci)

# Detailní příkazy (ze složky frontend/)
cd frontend
npm run types                   # TypeScript typová kontrola (tsc)
npm run types:watch             # tsc ve watch módu
npm run lint                    # ESLint + Prettier check
npm run lint!                   # ESLint + Prettier autofix
npm run vitest                  # pouze Vitest testy
npm run vitest:watch            # Vitest ve watch módu
npm run build                   # produkční build (Webpack)
npm run build:analyze           # bundle analyzer
```

## Architektura

Systém pro správu lekcí a kurzů — Django REST API backend + React SPA frontend, nasazení na Fly.io.

**Větev pro vývoj a CI je `master`** (ne `main`).

### Backend

Django 6 + Django REST Framework — REST API pro všechny operace. Kód je rozdělen do Django aplikací:

- [api/](api/) — DRF viewsets, serializéry, filtry, business logika; **zde žije veškerá API logika**
- [admin/](admin/) — modely, Django admin interface, šablony (shell pro SPA)
- [up/](up/) — projekt config: nastavení (`settings/base.py`, `settings/local.py`, `settings/production.py`), hlavní URL routing
- [tests/](tests/) — BDD E2E testy (behave), feature soubory v Gherkin, Selenium UI testy
- [scripts/shell/](scripts/shell/) — shell skripty pro CI (`ci/`) a lokální setup

**Modely** jsou v [admin/models.py](admin/models.py): klienti, skupiny, kurzy, lekce, přihlášky, stavy docházky.

**Nastavení:** `up/settings/` — `base.py` je základ, `local.py` a `production.py` ho přetěžují. V CI se používá `production.py` (`DJANGO_SETTINGS_MODULE=up.settings.production`). Lokálně se bere z `.env`.

**Python konvence:**
- Formátování: Black (`line-length = 100`)
- Typování: mypy — veškerý nový kód musí mít typové anotace, mypy nesmí hlásit chyby; pozor: `mypy.ini` má `exclude = tests`, E2E kroky tedy CI typově nehlídá (konvence pro ně platí dál)
- Dead code: vulture — nepoužívané symboly jsou chybou; vulture není zapojený v CI, spouští se ručně (bez whitelistu hlásí šum z migrací)
- Závislosti: Pipenv (`Pipfile` + `Pipfile.lock`) — nikdy `pip install` přímo

### Frontend

React 19 SPA v [frontend/src/](frontend/src/). Webpack dev server na portu 3000 se napojuje na Django přes proxy (HMR).

**`npm ci` z rootu** nainstaluje root závislosti (Husky) a přes `postinstall` hook automaticky provede `cd frontend && npm ci && npm run build:ci`. Pro vývoj je proto potřeba `npm ci` spustit z rootu, ne ze složky `frontend/`.

**Klíčové knihovny:**
- Routing: TanStack Router (`frontend/src/router.tsx`, URL konstanty v `frontend/src/APP_URLS.ts`)
- Server state: TanStack Query (React Query) — veškerá komunikace s API
- CSS: vanilla-extract (type-safe CSS-in-JS, soubory `*.css.ts`)
- UI: Mantine 9 (`@mantine/core`, `form`, `hooks`, `notifications`, `spotlight`) + FontAwesome PRO ikony
- Dark mode: barevné schéma (světlý/tmavý/systém) přes Mantine, přepínač v inkoustovém pruhu; FOUC řeší init skript `admin/static/admin/color-scheme-init.js`
- Fuzzy search: Fuse.js
- Grafy: Recharts

**Struktura `frontend/src/`:**
- `api/` — API client (axios) a query hooky (TanStack Query)
- `components/` — sdílené React komponenty
- `pages/` — stránkové komponenty (Diary, Dashboard, atd.)
- `forms/` — formulářové komponenty
- `types/` — TypeScript typy sdílené napříč aplikací
- `hooks/` — custom React hooky
- `contexts/` — React Context provídery

### Vizuální jazyk

Aplikace má **jedno chrome: inkoustový pruh navigace vlevo** (`AppShell.Navbar`
v `frontend/src/Main.tsx`). Nad breakpointem `md` žádná horní lišta neexistuje; pod ním
se pruh chová jako drawer a zbývá slim hlavička s burgerem. **Pruh se nesbaluje** — je vždy
široký `RAIL_WIDTH_LABELS` a popisky jsou vidět pořád. Sbalování na ikony sem nezaváděj:
ovládací prvek navíc a měnící se šířka plochy za ušetřené místo nestojí a diář si šířku
řeší sám stropem sloupce dne.

**Označení prostředí** (testing / demo / vývojová verze) nesmí zmizet — nad reálně vypadajícími
daty musí být poznat, že nejde o produkci. Nese ho `EnvBadge` v patičce pruhu a pod `md` navíc
ve slim hlavičce, protože tam je pruh zavřený drawer.

Obsah leží **v ohraničených panelech na tónované ploše.** Pravidla, která platí napříč:

- **Plocha stránky je tónovaná** (`vars.bg.page` = `#f4f7fb` / `dark-8`), obsah na ní stojí
  v panelech na `vars.bg.surface` (bílá / `dark-7`). Bílá plocha pod bílým obsahem nedá
  poznat, kde blok začíná a končí.
- Panel dělá **`surfacePanel`** v `global/surfaces.css.ts` (rámeček + rádius + `bg.surface`).
  Je to jediný zdroj pravdy — skládá ho `surfaceCard`, `tableSection`, sloupec dne v diáři
  i sloupec kurzu na kartě. Vnořený `tableSection` uvnitř panelu si rámeček nekreslí
  (jinak vznikne rámeček v rámečku).
- **Stín má jen to, co skutečně plave** — modal a dropdown (řeší Mantine), přihlašovací
  karta a tooltip grafu (`surfaceFloating`). Na obsahu stránky stín nehledej; panely
  se od plochy oddělují rámečkem, ne stínem.
- **Barva kurzu** je uživatelský hex z Nastavení a nese ji **sytý podklad** — odstín se
  neředí, aby byl kurz poznat na první pohled. Recept je `courseBand` v `CourseName.css.ts`
  (podklad + `contrastingTextColor`); skládá ho hlavička kurzu na kartě klienta i u zájemců
  a chip v seznamu skupin (`<CourseName band />`), v diáři a přehledu totéž dělá pruh
  hlavičky lekce (`lectureHeader` v `DashboardDay.css.ts`). Tichou variantou je `courseDot`
  — ředěná tečka do hustého seznamu tam, kde barva není hlavní nosič. **Vše uvnitř sytého
  podkladu musí psát `currentColor`**; tlumené odstíny z palety na barvě kurzu zmizí. Čitelnost drží barva textu, kterou podle kontrastu dopočítá
  `contrastingTextColor` (`global/utils.ts`, přes `chroma`) a předá se pruhu jako
  `lectureVars.courseText`; proto je pruh i jeho text v obou motivech stejný.
  Jinde (tečka u názvu kurzu `courseDot` v `CourseName.css.ts`, levá linka skupiny zájemců
  `courseHeadingItem` v `Applications.css.ts`) barva prochází `color-mix` receptem, který ji
  srovná ke světlosti plochy — bez toho zmizí na bílé nebo na tmavé. `ColorPicker` varuje
  jen při kontrastu pod 2:1 vůči bílé, na tmavou plochu sám nestačí.
- **Lekce v diáři a přehledu nese identitu ve třech vrstvách:** kurz = barva pruhu,
  typ = ikona jednotlivec/skupina, stav = zrušená lekce přebíjí pruh i tělo červenou.
- **Tmavá paleta `dark-*` je v `theme/theme.ts` přebarvená do inkoustové škály**, aby
  odstín držely i komponenty, které si `--mantine-color-dark-N` berou samy.
  `dark-3` má na ploše jen 3.52:1 — je to odstín pro linky a ikony, **ne pro text**.
- **Text nikdy menší než `1rem`**, hierarchii nes vahou a barvou. Časy, peníze a počty
  mají `font-variant-numeric: tabular-nums`, aby se ve sloupci zarovnaly.

  Mantine má u většiny prvků výchozí velikost `sm` (0,875 rem = 14 px), což je pro provozní
  čtení příliš malé. Textové prvky obsahu proto
  mají v `theme.ts` `defaultProps: { size: "md" }` (tlačítka, pole, tabulky, odznaky,
  stránkování, alerty) a **u volání se `size` nepřebíjí zpět na `sm`**. Výjimkou je
  `ActionIcon`, kde `size` znamená rozměr plochy, ne velikost písma. Segmentové přepínače
  jedou přes `--sc-font-size` v `buttons/segmented.css.ts`.
- **Stavy nesmí nést jen barva** (WCAG 1.4.1): zrušená lekce má k podbarvení textový
  štítek, stav platby jiný glyf pro každý stav. Glyfy platby a „příště platit“ jsou z jedné
  kroužkované rodiny ve stejném slotu (`attendanceIconSlot`), aby se lišily významem
  a barvou, ne tvarem a velikostí — `AttendancePaidButton.css.ts` ten slot **skládá**,
  vlastní rozměr si nedeklaruje.
- **Prvky, které se přepínají mezi stavy, musí držet rozměr.** Položka pruhu (`navLink`)
  i značka (`railBrand`) mají pevnou výšku: sbalený pruh má jen ikonu, rozbalený k ní přidá
  popisek, a bez pevné výšky by se při rozbalení pod myší celé menu posunulo a kurzor by
  skončil nad jinou položkou.
- Kontrastní poměry v komentářích `theme/tokens.ts` jsou měřené vůči **povrchu panelu**
  (bílá v light, `dark-7` v dark), ne vůči ploše stránky — obsah leží v panelech.
  Při změně odstínu je přepočítej, nepřepisuj jen hodnotu.

**Frontend konvence:**
- Formátování: Prettier (`tabWidth: 4`, `printWidth: 100`)
- Linting: ESLint 9 s pluginy (react, typescript, jest-dom, testing-library, vanilla-extract, tanstack-query)
- CSS: soubory pojmenovány `*.css.ts`, **vždy** vanilla-extract — nikdy inline styly ani plain CSS
- Testy: Vitest + React Testing Library, soubory colocated se zdrojovým kódem (`*.test.ts` / `*.test.tsx`), API mockované přes MSW
- **`data-qa` atributy jsou kontrakt s E2E kroky** ([tests/ui_steps/](tests/ui_steps/)) — Selenium se drží jich, ne tříd ani struktury. Neodstraňuj je a needituj jejich hodnoty; při přestavbě UI je přenes na nový prvek. Totéž platí pro `data-qa-canceled` a `data-paid`.
- Selektory v `style()` u vanilla-extract musí cílit na `&`; potomci (`thead th`, `::before`) jdou jen přes `globalStyle` — `tsc` ani ESLint to nezachytí, spadne to až za běhu (`npm run vitest`)

**Pre-commit hooky (Husky + lint-staged):** automaticky spouštějí ESLint a Prettier na staged JS/TS souborech.

## Ověření změn

- **Po každé úpravě frontend souborů** (přidání importů, nové komponenty, přeformátování) spusť autofix před kontrolou:
  ```bash
  cd frontend && npm run lint!
  ```
  ESLint + Prettier opraví pořadí importů, zbytečné mezery a další formátovací chyby, které jinak hlásí CI jako errory.
- Čistě frontend změny ověř primárně přes `npm run frontend:test`.
- Backend změny ověř přes `pipenv run mypy .` a relevantní `manage.py test` / `behave`, ale až po spuštění PostgreSQL.
- Změny přesahující backend i frontend ideálně ověř na obou stranách; lokální "green" frontend testy neříkají nic o dostupnosti DB nebo API.

### Build a nasazení

**CI** ([`.github/workflows/test.yml`](.github/workflows/test.yml)) se spouští na každý push/PR do `master`:
1. Nainstaluje Node 20 + Python 3.12 + závislosti
2. Vytvoří `.npmrc` pro FontAwesome PRO z private GitHub Package Registry (token `GPR_TOKEN`)
3. Spustí frontend testy (typy + lint + vitest)
4. Spustí mypy
5. Nastartuje PostgreSQL 14 s českou locale v Dockeru
6. Buildne Django (migrace + staticfiles) přes `scripts/shell/release_tasks.sh`
7. Django deployment checklist
8. Django unit testy + E2E API testy + E2E UI testy (behave + Selenium/Firefox)
9. Nahraje code coverage do Codecov
10. Nasadí testing verzi na Fly.io (přeskočí pro Dependabot)

**Deploy** ([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)) se spouští na git tagy — nasadí produkci na Fly.io a pushne Docker image do ghcr.io.

**Prostředí:**
- Testing: automaticky nasazeno z `master`
- Produkce: manuálně přes git tag
