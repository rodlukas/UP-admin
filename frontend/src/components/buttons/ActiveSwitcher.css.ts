import { style } from "@vanilla-extract/css"

/** Šířka půlek: na mobilu ať přepínač zabere celý řádek, jinak drží čitelné minimum. */
export const activeSwitcher = style({
    "@media": {
        "(max-width: 767.98px)": {
            width: "100%",
        },
    },
})
