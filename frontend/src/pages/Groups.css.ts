import { style } from "@vanilla-extract/css"

import { vars } from "../theme/tokens"

export const staleAlert = style({
    margin: "0 auto 1rem",
    border: vars.borderShort.warningSoft,
    boxShadow: "0 8px 18px rgb(120 53 15 / 0.08)",
    maxWidth: "880px",
})

export const tableSection = style({
    marginTop: "0.2rem",
    border: vars.borderShort.default,
    borderRadius: vars.radius.md,
    boxShadow: vars.shadow.card,
    backgroundColor: vars.bg.surface,
    overflow: "hidden",
})

export const hiddenBelowSm = style({
    "@media": {
        "(max-width: 575px)": {
            display: "none",
        },
    },
})
