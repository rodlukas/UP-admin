import { style } from "@vanilla-extract/css"

import { vars } from "../theme/tokens"

export const buttonWrap = style({
    display: "inline-flex",
    borderRadius: vars.radius.sm,
    selectors: {
        "&:focus-visible": {
            outline: `2px solid ${vars.colors.primary}`,
            outlineOffset: "2px",
        },
        // Pri pending stavu visualne signalizuj „cekej", ale ponech pointer-events,
        // jinak by Mantine Tooltip prestal reagovat na hover. Kliknuti blokuje handler.
        '&[aria-busy="true"]': {
            opacity: 0.6,
            cursor: "wait",
        },
    },
})

export const attendancePaidButton = style({
    transition: "color 0.15s ease-in-out",
    cursor: "pointer",
})

export const attendancePaidButtonSuccess = style({
    color: vars.colors.success,
    selectors: {
        "&:hover": {
            color: vars.colors.successHover,
        },
    },
})

export const attendancePaidButtonDanger = style({
    color: vars.colors.danger,
    selectors: {
        "&:hover": {
            color: vars.colors.dangerHover,
        },
    },
})
