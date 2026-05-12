import { style } from "@vanilla-extract/css"

import { vars } from "../theme/tokens"

export const wrapper = style({
    marginTop: "0.65rem",
    textAlign: "center",
})

export const spinner = style({
    color: "var(--mantine-color-indigo-6)",
})

export const text = style({
    marginTop: "0.45rem",
    color: "light-dark(var(--mantine-color-gray-7), var(--mantine-color-gray-4))",
    fontWeight: 500,
})

export const longHint = style({
    marginLeft: "0.3rem",
    color: vars.text.muted,
    fontWeight: 400,
})

export const overlongAlert = style({
    marginTop: "0.5rem",
    marginRight: "auto",
    marginLeft: "auto",
    maxWidth: "30rem",
})
