import { style } from "@vanilla-extract/css"

import { vars } from "../theme/tokens"

export const chartBaseStyles = {
    border: vars.borderShort.default,
    borderRadius: vars.radius.md,
    backgroundColor: vars.bg.surface,
}

export const chartTooltip = style({
    ...chartBaseStyles,
    boxShadow: "0 8px 20px rgb(15 23 42 / 0.1)",
    padding: "0.5rem 0.75rem",
    lineHeight: 1.5,
    color: vars.text.primary,
    fontSize: "0.8rem",
})
