import { globalStyle, style } from "@vanilla-extract/css"

export const or = style({
    marginBottom: 0,
    marginTop: "0.5rem",
})

globalStyle(`${or} > *`, {
    verticalAlign: "middle",
})
