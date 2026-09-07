import { createVar, globalStyle, style } from "@vanilla-extract/css"

import { surfaceCard } from "../global/surfaces.css"
import { vars } from "../theme/tokens"

export { chartTooltip, tooltipSeriesColor, tooltipSeriesEntry } from "../components/charts.css"

export const statCard = style([
    surfaceCard,
    {
        padding: "1rem",
        height: "100%",
        // dlaždice v jednom řádku mřížky mají stejnou výšku i při různém počtu řádků rozpadu
        minHeight: "9rem",
    },
])

/**
 * Titulek statistické karty. Dřív verzálky s prostrkáním na 0,75 rem — zdrobnělý
 * verzálkový štítek nad každým číslem je nejčastější ozdoba generovaných dashboardů
 * a v aplikaci není text menší než 1 rem. Rozlišení nese váha a tlumená barva.
 */
export const statCardTitle = style({
    marginBottom: "0.5rem",
    color: vars.text.subtleMuted,
    fontSize: "1rem",
    fontWeight: 600,
})

export const metricValue = style({
    lineHeight: 1,
    letterSpacing: "-0.02em",
    color: vars.text.heading,
    fontSize: "2.4rem",
    fontWeight: 700,
    fontVariantNumeric: "tabular-nums",
})

export const statNote = style({
    marginBottom: "0.5rem",
    lineHeight: 1.45,
    color: vars.text.subtleMuted,
    fontSize: "1rem",
})

export const fetchingOverlay = style({
    transition: "opacity 0.15s ease-in-out",
    opacity: 0.5,
    pointerEvents: "none",
})

export const pageLead = style({
    marginBottom: "1rem",
    maxWidth: "42rem",
    lineHeight: 1.5,
    color: vars.text.subtleMuted,
    fontSize: "1rem",
})

export const sectionTightTop = style({
    marginTop: "0.5rem",
})

export const filterSection = style({
    marginBottom: "1rem",
    paddingBottom: "1rem",
})

/**
 * Přepínač rozsahu roků. `width: fit-content` je podstatné: `SegmentedControl` se jinak
 * roztáhne na celou šířku rodiče a tři volby pak zabírají 1300 px.
 */
export const yearFilterButtons = style({
    width: "fit-content",
    maxWidth: "100%",
})

globalStyle(`${yearFilterButtons} label`, {
    "@media": {
        "(max-width: 575.98px)": {
            minWidth: "4.5rem",
        },
    },
})

export const filterHeading = style({
    marginBottom: "0.25rem",
    color: vars.text.primary,
    fontSize: "1rem",
    fontWeight: 600,
})

export const filterHint = style({
    marginBottom: "0.5rem",
    maxWidth: "42rem",
    lineHeight: 1.45,
    color: vars.text.subtleMuted,
    fontSize: "1rem",
})

export const metricToggle = style({
    marginBottom: 0,
    width: "fit-content",
    maxWidth: "100%",
})

globalStyle(`${metricToggle} label`, {
    whiteSpace: "nowrap",
})

export const chartSection = style({
    marginTop: "0.25rem",
    marginBottom: "1rem",
})

export const totalLabel = style({
    marginBottom: "1rem",
    color: vars.text.muted,
    fontSize: "1rem",
})

export const breakdownRow = style({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
})

export const breakdownRowSpaced = style([
    breakdownRow,
    {
        marginBottom: "0.25rem",
    },
])

export const breakdownLabel = style({
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    color: vars.text.muted,
    fontSize: "1rem",
})

/**
 * Barva puntíku před popiskem řádku – dynamická přes assignInlineVars, stejný vzor
 * jako `tooltipSeriesColor` v charts.css.ts. Puntík se dřív nesl barvou `badge bg-*`
 * (Bootstrap); tady jde jen o kategorii, ne o důraz, proto malá tečka místo pilulky.
 */
export const breakdownDotColor = createVar()

export const breakdownDot = style({
    flexShrink: 0,
    borderRadius: "50%",
    backgroundColor: breakdownDotColor,
    width: "0.5rem",
    height: "0.5rem",
})

export const breakdownValue = style({
    color: vars.text.primary,
    fontWeight: 600,
    fontVariantNumeric: "tabular-nums",
})

export const tooltipLabel = style({
    marginBottom: "0.25rem",
    fontWeight: 600,
})

export const tooltipRow = style({
    display: "flex",
    justifyContent: "space-between",
    gap: "0.75rem",
})

export const rankingDivider = style({
    borderBottom: vars.borderShort.default,
})

export const sectionTightTopMb = style([
    sectionTightTop,
    {
        marginBottom: "1rem",
    },
])

export const gridMb = style({
    marginBottom: "1rem",
})

export const chartTitleRow = style({
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "0.5rem",
    marginBottom: "0.25rem",
    "@media": {
        "(max-width: 767.98px)": {
            alignItems: "flex-start",
            justifyContent: "flex-start",
        },
    },
})

export const chartTitle = style({
    marginBottom: 0,
    color: vars.text.primary,
    fontSize: "1.05rem",
    fontWeight: 600,
})

export const chartCaption = style({
    marginBottom: "0.75rem",
    maxWidth: "48rem",
    lineHeight: 1.45,
    color: vars.text.subtleMuted,
    fontSize: "1rem",
})

export const chartPanel = style([
    surfaceCard,
    {
        padding: "1rem",
        "@media": {
            "(max-width: 767.98px)": {
                padding: "0.5rem",
            },
        },
    },
])

export const chartEmpty = style({
    marginBottom: 0,
    color: vars.text.subtleMuted,
    fontSize: "1rem",
})
