import { globalStyle, style } from "@vanilla-extract/css"

export const heading = style({})

globalStyle(`${heading} h1`, {
    fontSize: "2rem",
    fontWeight: 600,
})

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
