import { globalStyle, style } from "@vanilla-extract/css"

import { vars } from "../theme/tokens"

export const headingButtons = style({
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: "0.4rem",
    "@media": {
        "(max-width: 767.98px)": {
            justifyContent: "flex-start",
            width: "100%",
        },
    },
})

export const headingTitle = style({
    margin: 0,
    color: vars.text.primary,
})

export const headingWithoutButtons = style({
    width: "100%",
})

globalStyle(`${headingButtons} > *`, {
    "@media": {
        "(max-width: 767.98px)": {
            marginTop: "0.3rem",
        },
    },
})

globalStyle(`${headingTitle} .mantine-Badge-root`, {
    verticalAlign: "middle",
})
