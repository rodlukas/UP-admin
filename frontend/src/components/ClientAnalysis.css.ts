import { style } from "@vanilla-extract/css"

import { surfaceCard } from "../global/surfaces.css"
import { vars } from "../theme/tokens"

export { chartTooltip as tooltip, tooltipSeriesColor, tooltipSeriesEntry } from "./charts.css"

/**
 * Povrch karty analýzy. Nese ho komponenta sama (ne volající) — když analýza nemá co
 * zobrazit, vrací `null` a nezůstane po ní prázdná karta.
 */
export const chartPanel = style([
    surfaceCard,
    {
        flexGrow: 1,
        padding: "0.8rem",
        minWidth: 0,
    },
])

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
