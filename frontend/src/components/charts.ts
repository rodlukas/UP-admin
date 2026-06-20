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
export const AXIS_TICK = { fontSize: 12, fill: "var(--up-chart-tick-fill)" } as const
export const AXIS_LABEL = { fontSize: 11, fill: "var(--up-chart-tick-fill)" } as const
export const GRID_STROKE = "var(--up-chart-grid-stroke)"
export const LEGEND_FONT = { fontSize: 12 } as const

export type ChartMargin = {
    top: number
    right: number
    left: number
    bottom: number
}
