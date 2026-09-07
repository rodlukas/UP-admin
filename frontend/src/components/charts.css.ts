import { createVar, globalStyle, style } from "@vanilla-extract/css"

import { surfaceFloating } from "../global/surfaces.css"
import { vars } from "../theme/tokens"

// Recharts předává `stroke`/`fill` jako SVG prezentační atributy — `var()` v nich funguje
// (osvědčeno stávajícím kódem), ale `light-dark()` přímo v hodnotě atributu spolehlivé není.
// Přepínání schémat proto řeší tyto CSS proměnné (stejný vzor jako remap v index.css.ts)
// a v atributech grafů zůstává jen čistý `var()` — viz konstanty v charts.ts.
// Kontrasty: light gray-7 ticks = 8.18:1 na bílé (gray-6 měla jen 3.32:1);
// dark dark-1 ticks = 7.83:1 na dark-7. Mřížka: light gray-3, dark dark-4 (dekorativní linky
// kontrast nevyžadují — gray-3 by ale v dark módu nepatřičně zářila).
globalStyle(":root", {
    vars: {
        "--up-chart-grid-stroke": "var(--mantine-color-gray-3)",
        "--up-chart-tick-fill": "var(--mantine-color-gray-7)",
        // Statusové řady grafů (individuální / skupinové / zrušené). Individuální drží
        // značkové indigo; skupinové a zrušené jsou proti syté Mantine paletě (teal-6,
        // red-6) ztlumené do klidnějších tónů, aby ladily s inkoustovou plochou. Čitelnost
        // legendy nese remap barvy textu níže, ne sytost výplně — tón proto může být tišší.
        "--up-chart-series-individual": "var(--mantine-color-indigo-6)",
        "--up-chart-series-group": "#2f9e78",
        "--up-chart-series-canceled": "#cb5a52",
    },
})

globalStyle(":root[data-mantine-color-scheme='dark']", {
    vars: {
        "--up-chart-grid-stroke": "var(--mantine-color-dark-4)",
        "--up-chart-tick-fill": "var(--mantine-color-dark-1)",
        // Na tmavé ploše potřebují tlumené tóny o stupeň víc jasu, aby nezapadly.
        "--up-chart-series-individual": "var(--mantine-color-indigo-4)",
        "--up-chart-series-group": "#43c49a",
        "--up-chart-series-canceled": "#ef8f88",
    },
})

/** Plovoucí tooltip grafu — leží nad plochou grafu, a smí tedy mít stín. */
export const chartTooltip = style([
    surfaceFloating,
    {
        padding: "0.5rem 0.75rem",
        lineHeight: 1.5,
        color: vars.text.primary,
        fontSize: "0.8rem",
    },
])

/**
 * Recharts obarvuje text položky legendy barvou série (fill baru/čáry) — barvy kurzů
 * i palety grafů na tom mají 2,2–4,4:1 vůči povrchu, tedy pod WCAG AA. Sérii identifikuje
 * barevná ikona vedle textu, samotný popisek proto vracíme na běžnou barvu textu.
 */
globalStyle(".recharts-legend-item-text", {
    color: `${vars.text.primary} !important`,
})

/** Barva série grafu pro položku tooltipu — dynamická hodnota přes assignInlineVars. */
export const tooltipSeriesColor = createVar()

/** Položka tooltipu grafu obarvená barvou své série (místo inline `style={{ color }}`). */
export const tooltipSeriesEntry = style({
    color: tooltipSeriesColor,
})
