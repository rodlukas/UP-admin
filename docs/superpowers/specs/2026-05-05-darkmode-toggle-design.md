# Design: Dark mode toggle v nastavení

> **Odchylka implementace:** přepínač nakonec není `SegmentedControl` na stránce Nastavení,
> ale dropdown menu v navbaru (`ColorSchemeToggle.tsx`, `data-qa="color_scheme_toggle"`).
> Důvod: navbar je dostupný odkudkoliv v aplikaci, uživatel nemusí kvůli změně schématu
> navštěvovat Nastavení — lepší UX. Zbytek specifikace (hodnoty, ikony, localStorage přes
> Mantine) platí beze změny.

## Shrnutí

Přidání přepínače barevného schématu (světlý / tmavý / systém) na stránku Nastavení. Volba se automaticky ukládá do localStorage přes Mantine.

## Umístění

Nová karta "Vzhled aplikace" v `Settings.tsx`, vložená jako samostatný řádek pod stávajícím `SimpleGrid` (kurzy + stavy účasti), nad blokem s verzí aplikace (`footerBlock`).

## Komponenta

- `useMantineColorScheme()` z Mantine → `colorScheme`, `setColorScheme`
- `SegmentedControl` se třemi hodnotami:
  - `"auto"` → "Systém"
  - `"light"` → "Světlý"
  - `"dark"` → "Tmavý"
- Ikony: FontAwesome (monitor / slunce / měsíc) z `@rodlukas/fontawesome-pro-solid-svg-icons`
- Layout: label "Barevné schéma" vlevo + `SegmentedControl` vpravo — stejný pattern jako `configRow` / `configRowLabel` / `configRowControl`

## localStorage

Mantine ukládá volbu automaticky do `localStorage['mantine-color-scheme']` — žádný vlastní kód pro ukládání není potřeba. Výchozí hodnota při prvním spuštění je `"auto"` (odpovídá systémovému nastavení), což odpovídá stávajícímu `defaultColorScheme="auto"` v `MantineProvider`.

## CSS

Nová třída `appearanceSection` v `Settings.css.ts` — stejný vizuální styl jako `footerBlock` (border, box-shadow, border-radius, background s `light-dark()`).

## Soubory ke změně

- `frontend/src/pages/Settings.tsx` — přidání sekce s `SegmentedControl`
- `frontend/src/pages/Settings.css.ts` — přidání stylu `appearanceSection`
