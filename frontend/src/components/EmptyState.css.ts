import { style } from "@vanilla-extract/css"

import { vars } from "../theme/tokens"

export const emptyState = style({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    borderTop: vars.borderShort.default,
    padding: "2.5rem 1rem",
    textAlign: "center",
})

export const icon = style({
    marginBottom: "0.75rem",
    color: vars.border.strong,
    fontSize: "1.75rem",
})

export const title = style({
    margin: 0,
    color: vars.text.heading,
    fontSize: "1.125rem",
    fontWeight: 600,
})

export const description = style({
    margin: "0.3rem 0 0",
    maxWidth: "34rem",
    textWrap: "pretty",
    color: vars.text.subtleMuted,
})

export const action = style({
    marginTop: "1rem",
})
