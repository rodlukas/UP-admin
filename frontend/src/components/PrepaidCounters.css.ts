import { style } from "@vanilla-extract/css"

import { surfaceCard } from "../global/surfaces.css"
import { vars } from "../theme/tokens"

export const memberCard = style([
    surfaceCard,
    {
        padding: "0.8rem",
        height: "100%",
    },
])

export const memberHeading = style({
    marginBottom: "0.55rem",
    color: vars.text.primary,
    fontSize: "1.02rem",
})

export const prepaidCountersInput = style({
    minWidth: "3.75rem",
    fontWeight: 600,
})

export const prepaidCountersInputGroupLabel = style({
    backgroundColor: vars.colors.successSolid,
    color: "white",
})
