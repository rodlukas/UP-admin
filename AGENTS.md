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

# 3. Spusť databázi a servery
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

> **PostgreSQL je povinné i pro testy:** před `pipenv run python manage.py test` nebo `behave` nejdřív spusť DB přes `make db` nebo `docker compose up`. Bez běžící PostgreSQL na `localhost:5432` backend testy selžou už při inicializaci testovací databáze.

### Frontend (TypeScript / React)

```bash
# Testy a kvalita kódu (z rootu repozitáře — doporučeno pro CI paritu)
npm run frontend:test           # typy + lint + jest (kompletní frontend CI suite)
npm run frontend:lint:js        # pouze ESLint
npm run frontend:audit          # security audit závislostí (audit-ci)

# Detailní příkazy (ze složky frontend/)
cd frontend
npm run types                   # TypeScript typová kontrola (tsc)
npm run types:watch             # tsc ve watch módu
npm run lint                    # ESLint + Prettier check
npm run lint!                   # ESLint + Prettier autofix
npm run jest                    # pouze Jest testy
npm run jest:watch              # Jest ve watch módu
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
- Typování: mypy — veškerý nový kód musí mít typové anotace, mypy nesmí hlásit chyby
- Dead code: vulture — nepoužívané symboly jsou chybou
- Závislosti: Pipenv (`Pipfile` + `Pipfile.lock`) — nikdy `pip install` přímo

### Frontend

React 19 SPA v [frontend/src/](frontend/src/). Webpack dev server na portu 3000 se napojuje na Django přes proxy (HMR).

**`npm ci` z rootu** nainstaluje root závislosti (Husky) a přes `postinstall` hook automaticky provede `cd frontend && npm ci && npm run build:ci`. Pro vývoj je proto potřeba `npm ci` spustit z rootu, ne ze složky `frontend/`.

**Klíčové knihovny:**
- Routing: TanStack Router (`frontend/src/router.tsx`, URL konstanty v `frontend/src/APP_URLS.ts`)
- Server state: TanStack Query (React Query) — veškerá komunikace s API
- CSS: vanilla-extract (type-safe CSS-in-JS, soubory `*.css.ts`)
- UI: Reactstrap (Bootstrap 5 wrappery) + FontAwesome PRO ikony
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

**Frontend konvence:**
- Formátování: Prettier (`tabWidth: 4`, `printWidth: 100`)
- Linting: ESLint 9 s pluginy (react, typescript, jest, testing-library, vanilla-extract, tanstack-query)
- CSS: soubory pojmenovány `*.css.ts`, **vždy** vanilla-extract — nikdy inline styly ani plain CSS
- Testy: Jest + React Testing Library, soubory colocated se zdrojovým kódem (`*.test.ts` / `*.test.tsx`), API mockované přes MSW

**Pre-commit hooky (Husky + lint-staged):** automaticky spouštějí ESLint a Prettier na staged JS/TS souborech.

## Ověření změn

- Čistě frontend změny ověř primárně přes `npm run frontend:test`.
- Backend změny ověř přes `pipenv run mypy .` a relevantní `manage.py test` / `behave`, ale až po spuštění PostgreSQL.
- Změny přesahující backend i frontend ideálně ověř na obou stranách; lokální "green" frontend testy neříkají nic o dostupnosti DB nebo API.

### Build a nasazení

**CI** ([`.github/workflows/test.yml`](.github/workflows/test.yml)) se spouští na každý push/PR do `master`:
1. Nainstaluje Node 20 + Python 3.12 + závislosti
2. Vytvoří `.npmrc` pro FontAwesome PRO z private GitHub Package Registry (token `GPR_TOKEN`)
3. Spustí frontend testy (typy + lint + jest)
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
