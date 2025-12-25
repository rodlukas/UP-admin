import { style } from "@vanilla-extract/css"

export const attendancePaidButton = style({
    position: "relative",
    top: "0.06rem",
    transition: "color 0.15s ease-in-out",
    cursor: "pointer",
})

export const attendancePaidButtonSuccess = style({
    selectors: {
        "&:hover": {
            color: "#218838 !important",
        },
    },
})

export const attendancePaidButtonDanger = style({
    selectors: {
        "&:hover": {
            color: "#c82333 !important",
        },
    },
})
