import { style } from "@vanilla-extract/css"

import { vars } from "../theme/tokens"

export const button = style({
    display: "inline-flex",
    alignItems: "center",
    gap: "0.4rem",
    color: "inherit",
    font: "inherit",
    selectors: {
        "&:hover": {
            color: vars.text.primary,
        },
    },
})

/** Neaktivní sloupec: ikona je vidět (jde řadit), ale nekřičí. */
export const icon = style({
    opacity: 0.35,
})

export const iconActive = style({
    color: vars.text.primary,
})
