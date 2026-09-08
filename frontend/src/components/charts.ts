import "./charts.css"

/** Krátké názvy měsíců pro osu X grafů. */
export const MONTH_LABELS = [
    "Led",
    "Úno",
    "Bře",
    "Dub",
    "Kvě",
    "Čvn",
    "Čvc",
    "Srp",
    "Zář",
    "Říj",
    "Lis",
    "Pro",
] as const

// Adaptivní barvy (light/dark) jsou definované v charts.css.ts — viz komentář tamtéž.
// fontFamily je explicitní (ne spoléhání na dědění z body) — Recharts kreslí do <svg>,
// kde by jinak o výchozí font rozhodoval user-agent stylesheet prohlížeče, ne Mantine.
const CHART_FONT_FAMILY = "var(--mantine-font-family)"
/**
 * Text v grafech drží stejné minimum jako text ve zbytku aplikace — `1rem`, ani osy
 * a legenda z pravidla výjimku nemají (viz `fontSizes` v theme/theme.ts). Hodnota je
 * v `rem`, ne v px: Recharts ji předává do SVG jako prezentační atribut, kde CSS
 * jednotka platí, takže popisky rostou s velikostí písma prohlížeče stejně jako
 * ostatní text. Šířky os (`width` u `YAxis`, `yAxisWidth` ve Statistics.tsx) jsou na
 * tuhle velikost dopočítané — při změně je nutné projít i je.
 */
const CHART_FONT_SIZE = "1rem"
export const AXIS_TICK = {
    fontSize: CHART_FONT_SIZE,
    fontFamily: CHART_FONT_FAMILY,
    fill: "var(--up-chart-tick-fill)",
} as const
export const AXIS_LABEL = {
    fontSize: CHART_FONT_SIZE,
    fontFamily: CHART_FONT_FAMILY,
    fill: "var(--up-chart-tick-fill)",
} as const
export const GRID_STROKE = "var(--up-chart-grid-stroke)"
export const LEGEND_FONT = { fontSize: CHART_FONT_SIZE, fontFamily: CHART_FONT_FAMILY } as const

export type ChartMargin = {
    top: number
    right: number
    left: number
    bottom: number
}
