import { style } from "@vanilla-extract/css"

export const bankTitle = style({
    padding: "0.75rem",
})

export const bankTitleText = style({
    "@media": {
        "(min-width: 576px)": {
            paddingLeft: "2.3125rem",
        },
    },
})
