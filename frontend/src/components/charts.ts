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
export const AXIS_TICK = {
    fontSize: 12,
    fontFamily: CHART_FONT_FAMILY,
    fill: "var(--up-chart-tick-fill)",
} as const
export const AXIS_LABEL = {
    fontSize: 11,
    fontFamily: CHART_FONT_FAMILY,
    fill: "var(--up-chart-tick-fill)",
} as const
export const GRID_STROKE = "var(--up-chart-grid-stroke)"
export const LEGEND_FONT = { fontSize: 12, fontFamily: CHART_FONT_FAMILY } as const

export type ChartMargin = {
    top: number
    right: number
    left: number
    bottom: number
}
