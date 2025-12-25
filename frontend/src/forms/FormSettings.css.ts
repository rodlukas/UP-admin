import { style } from "@vanilla-extract/css"

export const labelDuration = style({
    "@media": {
        "(min-width: 576px)": {
            lineHeight: 0.8,
        },
    },
})
