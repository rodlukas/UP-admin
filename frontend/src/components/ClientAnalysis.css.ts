import { style } from "@vanilla-extract/css"

import { vars } from "../theme/tokens"

import { chartBaseStyles } from "./charts.css"

export { chartTooltip as tooltip, tooltipSeriesColor, tooltipSeriesEntry } from "./charts.css"

export const chartPanel = style({
    ...chartBaseStyles,
    boxShadow: vars.shadow.card,
    padding: "0.8rem",
})

export const tooltipLabel = style({
    marginBottom: "0.25rem",
    fontWeight: 600,
})

export const tooltipTotal = style({
    marginTop: "0.25rem",
    borderTop: vars.borderShort.default,
    paddingTop: "0.25rem",
})

export const summary = style({
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-around",
    gap: "0.5rem",
    marginBottom: "1rem",
    paddingTop: "0.25rem",
})

export const summaryItem = style({
    textAlign: "center",
})

export const summaryNumber = style({
    marginBottom: 0,
    fontSize: "1.25rem",
    fontWeight: 700,
})

export const summaryLabel = style({
    color: vars.text.muted,
    fontSize: "0.875em",
})

export const chartDivider = style({
    marginTop: "0.5rem",
    borderTop: vars.borderShort.default,
    paddingTop: "1rem",
})
