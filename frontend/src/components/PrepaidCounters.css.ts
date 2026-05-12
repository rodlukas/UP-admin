import { style } from "@vanilla-extract/css"

import { vars } from "../theme/tokens"

export const memberCard = style({
    border: vars.borderShort.default,
    borderRadius: vars.radius.md,
    boxShadow: "0 12px 24px rgb(15 23 42 / 0.08)",
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
    backgroundColor: "var(--mantine-color-green-7)",
    color: "white",
})
