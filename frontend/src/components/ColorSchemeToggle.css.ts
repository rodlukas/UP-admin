import { style } from "@vanilla-extract/css"

import { vars } from "../theme/tokens"

import { navbarFocusRing } from "./Menu.css"

/**
 * Spouštěč přepínače. Na desktopu ikona samotná, v rozbaleném mobilním menu řádek
 * s popiskem — mezi textovými položkami menu by osamocená ikona nebyla srozumitelná.
 */
export const toggleButton = style({
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    transition: "all 0.15s ease-in-out",
    borderRadius: vars.radius.md,
    color: "rgb(241 245 249 / 0.85)",
    ":hover": {
        backgroundColor: "rgb(255 255 255 / 0.12)",
        color: "#ffffff",
    },
    selectors: {
        "&.mantine-focus-auto:focus-visible": navbarFocusRing,
    },
    "@media": {
        "(min-width: 992px)": {
            justifyContent: "center",
            marginLeft: "0.25rem",
            padding: "0.4rem 0.55rem",
        },
        "(max-width: 991.98px)": {
            marginTop: "0.25rem",
            padding: "0.5rem 0.85rem",
            width: "100%",
            fontWeight: 500,
        },
    },
})

/** Popisek vedle ikony — jen v mobilním menu, na desktopu stačí ikona s tooltipem. */
export const toggleLabel = style({
    "@media": {
        "(min-width: 992px)": {
            display: "none",
        },
    },
})

export const dropdown = style({
    border: "none",
})
