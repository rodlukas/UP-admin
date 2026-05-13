import { style } from "@vanilla-extract/css"

import { vars } from "../theme/tokens"

export const attendancePaidButton = style({
    transition: "color 0.15s ease-in-out",
    cursor: "pointer",
})

export const attendancePaidButtonSuccess = style({
    color: vars.colors.success,
    selectors: {
        "&:hover": {
            color: `${vars.colors.successHover} !important`,
        },
    },
})

export const attendancePaidButtonDanger = style({
    color: vars.colors.danger,
    selectors: {
        "&:hover": {
            color: `${vars.colors.dangerHover} !important`,
        },
    },
})
