import { globalStyle, style } from "@vanilla-extract/css"

export const headingButtons = style({})

globalStyle(`${headingButtons} > * + *`, {
    marginLeft: "0.3rem",
})

globalStyle(`${headingButtons} > *`, {
    "@media": {
        "(max-width: 991.98px)": {
            marginTop: "0.3rem",
        },
    },
})
