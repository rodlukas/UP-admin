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

export const AXIS_TICK = { fontSize: 12, fill: "var(--mantine-color-gray-6)" } as const
export const AXIS_LABEL = { fontSize: 11, fill: "var(--mantine-color-gray-6)" } as const
export const GRID_STROKE = "var(--mantine-color-gray-3)"
export const LEGEND_FONT = { fontSize: 12 } as const

export const CHART_PALETTE = [
    "var(--mantine-color-indigo-6)",
    "var(--mantine-color-green-6)",
    "var(--mantine-color-orange-6)",
    "var(--mantine-color-red-6)",
    "var(--mantine-color-teal-6)",
    "var(--mantine-color-violet-6)",
    "var(--mantine-color-yellow-6)",
    "var(--mantine-color-cyan-6)",
] as const

export type ChartMargin = {
    top: number
    right: number
    left: number
    bottom: number
}
