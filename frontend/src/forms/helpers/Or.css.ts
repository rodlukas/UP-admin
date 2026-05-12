import { globalStyle, style } from "@vanilla-extract/css"

export const or = style({
    marginTop: "0.55rem",
    marginBottom: 0,
    padding: 0,
})

globalStyle(`${or} > *`, {
    verticalAlign: "middle",
})
