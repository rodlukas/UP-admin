import { globalStyle, style } from "@vanilla-extract/css"

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

export const statCardTitle = style({
    marginBottom: "0.5rem",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    color: vars.text.subtleMuted,
    fontSize: "0.75rem",
    fontWeight: 600,
})

export const metricValue = style({
    lineHeight: 1,
    fontSize: "2.4rem",
    fontWeight: 700,
})

export const statNote = style({
    marginBottom: "0.5rem",
    lineHeight: 1.45,
    color: vars.text.subtleMuted,
    fontSize: "0.75rem",
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
    fontSize: "0.875rem",
})

export const sectionTightTop = style({
    marginTop: "0.5rem",
})

export const filterSection = style({
    marginBottom: "1rem",
    paddingBottom: "1rem",
})

export const yearFilterButtons = style({
    display: "flex",
    flexWrap: "wrap",
    gap: "0.25rem",
})

globalStyle(`${yearFilterButtons} > *`, {
    "@media": {
        "(max-width: 575.98px)": {
            flex: 1,
            minWidth: "4.5rem",
        },
    },
})

export const filterHeading = style({
    marginBottom: "0.25rem",
    color: vars.text.primary,
    fontSize: "0.875rem",
    fontWeight: 600,
})

export const filterHint = style({
    marginBottom: "0.5rem",
    maxWidth: "42rem",
    lineHeight: 1.45,
    color: vars.text.subtleMuted,
    fontSize: "0.8rem",
})

export const metricToggle = style({
    marginBottom: 0,
    "@media": {
        "(max-width: 767.98px)": {
            display: "flex",
            width: "100%",
        },
    },
})

globalStyle(`${metricToggle} button`, {
    whiteSpace: "nowrap",
    "@media": {
        "(max-width: 767.98px)": {
            flex: 1,
            minWidth: 0,
        },
    },
})

export const chartSection = style({
    marginTop: "0.25rem",
    marginBottom: "1rem",
})

export const totalLabel = style({
    marginBottom: "1rem",
    color: vars.text.muted,
    fontSize: "0.875em",
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

export const breakdownValue = style({
    fontWeight: 600,
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
    fontSize: "0.8rem",
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
    fontSize: "0.875rem",
})
