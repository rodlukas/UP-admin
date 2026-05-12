import { style } from "@vanilla-extract/css"

export const labelDuration = style({
    lineHeight: 1.25,
    "@media": {
        "(min-width: 576px)": {
            lineHeight: 1.15,
        },
    },
})
