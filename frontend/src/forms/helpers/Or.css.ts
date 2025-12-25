import { globalStyle, style } from "@vanilla-extract/css"

export const or = style({
    marginTop: "0.5rem",
    marginBottom: 0,
})

globalStyle(`${or} > *`, {
    verticalAlign: "middle",
})
