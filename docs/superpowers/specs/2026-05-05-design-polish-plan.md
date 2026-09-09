# Design Polish Plan – ÚPadmin

Kompletní přehled problémů nalezených průchodem celé aplikace (light + dark mode, desktop + mobile). Skupiny jsou seřazeny podle priority.

---

## Skupina A — Dark mode bugs (hardcoded light-only barvy)

Tři konkrétní místa v kódu, kde se používají Mantine pastelové shade-1/2 barvy, které jsou navrženy pouze pro light mode. V dark mode jsou téměř neviditelné nebo vizuálně špatné.

### A1 – Bank.tsx: titulek zelený/červený (řádek 165)

**Soubor:** `frontend/src/components/Bank.tsx`

```tsx
// PROBLÉM:
bg={isLackOfMoney ? "red.1" : "green.1"}
// green.1 a red.1 jsou velmi světlé pastelové barvy = v dark mode text splývá s pozadím
```

**Fix:** Nahradit Mantine `bg` prop za `style={{ backgroundColor: "light-dark(...)" }}` nebo použít CSS třídu v `Bank.css.ts`.

```tsx
// v Bank.css.ts přidat:
export const bankTitleOk = style({
  backgroundColor: "light-dark(var(--mantine-color-green-1), var(--mantine-color-green-9))",
})
export const bankTitleWarning = style({
  backgroundColor: "light-dark(var(--mantine-color-red-1), var(--mantine-color-red-9))",
})
// + odpovídající text color pro obě varianty
```

### A2 – Bank.tsx: dnešní řádek transakce (řádek 103)

**Soubor:** `frontend/src/components/Bank.tsx`

```tsx
// PROBLÉM:
<Table.Tr key={id} bg={isToday(date) ? "yellow.1" : undefined}>
// yellow.1 = světle žlutá, v dark mode téměř neviditelná / nevhodná
```

**Fix:** Inline style nebo CSS třída s `light-dark(var(--mantine-color-yellow-1), var(--mantine-color-yellow-9))`.

### A3 – DashboardDay.tsx: záhlaví dnešního dne (řádek 133)

**Soubor:** `frontend/src/components/DashboardDay.tsx`

```tsx
// PROBLÉM:
bg={isToday(getDate()) ? "blue.2" : undefined}
// blue.2 je velmi světlá modrá = v dark mode příliš jasná/nevhodná
```

**Fix:** CSS třída s `light-dark(var(--mantine-color-blue-1), var(--mantine-color-blue-9))`, nebo přidat podmíněnou třídu v `DashboardDay.css.ts`:

```ts
export const dashboardDayDateToday = style({
  backgroundColor: "light-dark(var(--mantine-color-indigo-1), var(--mantine-color-indigo-9))",
})
```

---

## Skupina B — Design: Zájemci (Applications) — záhlaví kurzů

**Soubory:** `frontend/src/pages/Applications.tsx`, `frontend/src/pages/Applications.css.ts`

**Problém:** Záhlaví sekce kurzu (`courseHeadingItem`) používá plnou barvu kurzu jako background celého pásu s tmavým overlay. Výsledek je vizuálně velmi těžký, "Bootstrap 3 accordion panel" styl, působí zastarale.

**Aktuální stav:**
```ts
courseHeadingItem: {
  backgroundColor: `${applicationsVars.courseBackground} !important`,
  backgroundImage: "linear-gradient(rgb(15 23 42 / 0.2), rgb(15 23 42 / 0.2))",
  padding: "0.5rem 1rem",
}
// bílý text, barva kurzu jako plné pozadí celého pásu
```

**Navrhovaný fix:** Odlehčit záhlaví — místo plnobarevného pásu použít:
- Bílé/dark-7 pozadí (`light-dark(#fff, dark-7)`) se subtilní levou barevnou čarou (4px border-left v barvě kurzu)
- Kurz badge zůstane (component `CourseName`/`CourseCircle`), ale nebude dominovat celá šířka
- Text tmavý (ne bílý)

```ts
// nový styl courseHeadingItem:
export const courseHeadingItem = style({
  display: "flex",
  alignItems: "center",
  gap: "0.6rem",
  padding: "0.65rem 1rem",
  backgroundColor: "light-dark(#f8fafc, var(--mantine-color-dark-6))",
  borderBottom: "1px solid light-dark(#dbe3ed, var(--mantine-color-dark-4))",
  borderLeft: `4px solid ${applicationsVars.courseBackground}`,
})
// courseHeading text: dark color, žádný textShadow
// courseHeadingBadge: upravit pro nový kontext
```

---

## Skupina C — Rozestupy a padding (drobné, ale viditelné nedostatky)

### C1 – Hlavní nadpisy stránek (Heading komponenta)

**Soubor:** `frontend/src/components/Heading.tsx`

`my="md"` je 16px (Mantine `md` = 16px). Nadpisy stránek (H1) mají příliš malý spodní rozestup od obsahu stránky — vizuálně se obsah tísní hned pod nadpis.

**Fix:** Změnit `my="md"` na `mt="md" mb="lg"` (bottom 24px) nebo nastavit na `mt={12} mb={20}`.

### C2 – Dashboard: H1 nadpisy bez vizuální separace od karet

**Soubor:** `frontend/src/pages/Dashboard.tsx`

"Dnešní lekce" a "Bankovní účet" jsou H1 nadpisy, ale obojí jsou na jedné stránce jako dva samostatné sloupce. Nadpisy jsou příliš velké (h1 = 1.375rem + 1.5vw = ~40px na 1400px) pro "sekční" nadpisy.

**Fix:** Snížit na `order={2}` nebo přidat vlastní CSS `fontSize` override pro tyto sekční nadpisy (ne globální h1).

### C3 – Diary stránka: záhlaví bez vizuální oddělení od obsahu

**Soubor:** `frontend/src/pages/Diary.tsx`, `frontend/src/pages/Diary.css.ts`

Záhlaví "Týden 4. 5. – 8. 5." je velké a centered, pak hned pod ním jsou karty dní bez padding-top. Přidat `mb` pod záhlaví nebo `mt` nad karty.

**Konkrétní:** přidat `marginBottom: "1rem"` na záhlaví diáře (nebo `gap` na kontejner).

### C4 – Statistics: sekce "Rozsah lekcí" — malý rozestup nad filter tlačítky

**Soubor:** `frontend/src/pages/Statistics.css.ts`

`sectionTightTop` má `marginTop: "0.2rem"` — příliš malý rozestup pod titulkem sekce.

**Fix:** Zvýšit na `0.5rem`.

---

## Skupina D — Komponenta Card a lekce: dark mode (medium priority)

### D1 – Card.css.ts: lectureFuture a lecturePrepaid barvy

**Soubor:** `frontend/src/pages/Card.css.ts`

```ts
lectureFuture: "light-dark(#fff8dd, var(--mantine-color-yellow-9))"
lecturePrepaid: "light-dark(#ddf6e4, var(--mantine-color-green-9))"
```

`yellow-9` a `green-9` jsou v dark mode velmi tmavé (tmavě hnědá/tmavě zelená). Lépe by seděly `yellow-8` a `green-8`, nebo vlastní tmavší pastelové barvy.

**Fix:**
```ts
lectureFuture: "light-dark(#fff8dd, color-mix(in srgb, var(--mantine-color-yellow-9) 60%, var(--mantine-color-dark-7) 40%))"
```
Nebo jednoduše: `var(--mantine-color-yellow-8)` / `var(--mantine-color-green-8)`.

### D2 – DashboardDay / Card courseHeadingItem

**Soubor:** `frontend/src/pages/Card.css.ts`

Stejný pattern jako Zájemci (`courseHeadingItem` s plnou barvou kurzu). Na klientské kartě to slouží jako záhlaví každé lekce — zde je to vhodné (identifikuje kurz barvou), ale dark mode overlay může být příliš tmavý.

**Fix:** Snížit dark overlay intenzitu:
```ts
backgroundImage: "linear-gradient(rgb(15 23 42 / 0.15), rgb(15 23 42 / 0.15))"
// místo 0.28 / 0.2
```

---

## Skupina E — Drobná polish

### E1 – Bank title: text color v dark mode

Při opravě A1 zajistit, že text titulku banky (`bankTitleText`) má správný kontrast pro obě varianty (zelená/červená, light/dark).

### E2 – Odhlásit button v light mode

Tlačítko "Odhlásit" v navbaru má v light mode `variant` který ho renderuje jako šedý/outlined button. Vizuálně vypadá lehce inconsistentně vedle tmavého navbaru. Zkontrolovat variantu a případně použít `variant="light"` s explicitním `color="gray"` pro lepší kontrast na tmavém pozadí navbaru (navbar je vždy tmavý).

**Soubor:** `frontend/src/components/Menu.tsx` — zkontrolovat `Odhlásit` button props.

### E3 – PrepaidCounters dark mode

Rychle ověřit, zda `PrepaidCounters` komponenta (zobrazuje předplacené lekce) má správné barvy v dark mode.

---

## Souhrnná priorita implementace

| # | Problém | Soubory | Effort |
|---|---------|---------|--------|
| 1 | A1–A3: dark mode barvy (Bank + DashboardDay) | Bank.tsx, Bank.css.ts, DashboardDay.tsx, DashboardDay.css.ts | nízký |
| 2 | B: Zájemci headers redesign | Applications.tsx, Applications.css.ts | střední |
| 3 | C1–C4: Rozestupy | Heading.tsx, Dashboard.tsx, Diary.css.ts, Statistics.css.ts | nízký |
| 4 | D1: lectureFuture/Prepaid dark mode | Card.css.ts | nízký |
| 5 | D2: courseHeadingItem overlay | Card.css.ts, DashboardDay.css.ts | nízký |
| 6 | E1–E3: Drobná polish | Bank.css.ts, Menu.tsx | nízký |
