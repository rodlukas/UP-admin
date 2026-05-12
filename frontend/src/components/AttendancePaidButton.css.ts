import { style } from "@vanilla-extract/css"

export const attendancePaidButton = style({
    transition: "color 0.15s ease-in-out",
    cursor: "pointer",
})

export const attendancePaidButtonSuccess = style({
    color: "var(--mantine-color-green-7)",
    selectors: {
        "&:hover": {
            color: "var(--mantine-color-green-9) !important",
        },
    },
})

export const attendancePaidButtonDanger = style({
    color: "var(--mantine-color-red-7)",
    selectors: {
        "&:hover": {
            color: "var(--mantine-color-red-9) !important",
        },
    },
})
