import { style } from "@vanilla-extract/css"

import { vars } from "../theme/tokens"

export const chartBaseStyles = {
    border: vars.borderShort.default,
    borderRadius: vars.radius.md,
    backgroundColor: vars.bg.surface,
}

export const chartTooltip = style({
    ...chartBaseStyles,
    boxShadow: vars.shadow.elevated,
    padding: "0.5rem 0.75rem",
    lineHeight: 1.5,
    color: vars.text.primary,
    fontSize: "0.8rem",
})
