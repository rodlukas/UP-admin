import { style } from "@vanilla-extract/css"

export const attendancePaidButton = style({
    cursor: "pointer",
    position: "relative",
    top: "0.06rem",
    transition: "color 0.15s ease-in-out",
})

export const attendancePaidButtonSuccess = style({
    selectors: {
        "&:hover": {
            color: "#218838",
        },
    },
})

export const attendancePaidButtonDanger = style({
    selectors: {
        "&:hover": {
            color: "#c82333",
        },
    },
})
