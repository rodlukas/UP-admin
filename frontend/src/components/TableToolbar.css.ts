import { style } from "@vanilla-extract/css"

import { vars } from "../theme/tokens"

export const toolbar = style({
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "0.6rem",
    marginBottom: "0.75rem",
})

export const search = style({
    flex: "1 1 16rem",
    maxWidth: "24rem",
})

export const toolbarRight = style({
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "0.6rem",
})

/** Kolik řádků filtr nechal — ukazuje se jen při aktivním hledání. */
export const count = style({
    color: vars.text.subtleMuted,
    fontSize: "1rem",
    fontVariantNumeric: "tabular-nums",
})
