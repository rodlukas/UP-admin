import { style } from "@vanilla-extract/css"

import { vars } from "../theme/tokens"

export const memberCard = style({
    border: vars.borderShort.default,
    borderRadius: vars.radius.md,
    boxShadow: vars.shadow.card,
    backgroundColor: vars.bg.surface,
    padding: "0.8rem",
    height: "100%",
})

export const memberHeading = style({
    marginBottom: "0.55rem",
    color: vars.text.primary,
    fontSize: "1.02rem",
})

export const prepaidCountersInput = style({
    minWidth: "3.75rem !important",
    fontWeight: 600,
})

export const prepaidCountersInputGroupLabel = style({
    backgroundColor: vars.colors.successSolid,
    color: "white",
})
