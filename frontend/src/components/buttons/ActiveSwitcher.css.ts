import { globalStyle, style } from "@vanilla-extract/css"

export const activeSwitcher = style({})

globalStyle(`${activeSwitcher} .active`, {
    cursor: "default",
})
