import { globalStyle, style } from "@vanilla-extract/css"

import { vars } from "../../theme/tokens"

export const or = style({
    marginTop: "0.55rem",
    marginBottom: 0,
    padding: 0,
    color: vars.text.muted,
})

globalStyle(`${or} > *`, {
    verticalAlign: "middle",
})
