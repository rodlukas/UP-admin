import { globalStyle, style } from "@vanilla-extract/css"

export const footer = style({})

globalStyle(`${footer} a`, {
    textDecoration: "underline",
    color: "inherit",
})
