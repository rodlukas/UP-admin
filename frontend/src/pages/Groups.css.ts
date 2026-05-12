import { style } from "@vanilla-extract/css"

export const staleAlert = style({
    margin: "0 auto 1rem",
    border: "1px solid light-dark(#f3d38a, var(--mantine-color-yellow-7))",
    boxShadow: "0 8px 18px rgb(120 53 15 / 0.08)",
    maxWidth: "880px",
})

export const tableSection = style({
    marginTop: "0.2rem",
})

export const hiddenBelowSm = style({
    "@media": {
        "(max-width: 575px)": {
            display: "none",
        },
    },
})
