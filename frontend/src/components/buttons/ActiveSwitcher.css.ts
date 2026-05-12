import { globalStyle, style } from "@vanilla-extract/css"

export const activeSwitcher = style({
    display: "inline-flex",
    border: "none",
    borderRadius: "var(--mantine-radius-sm)",
    boxShadow: "inset 0 1px 2px rgb(0 0 0 / 0.04)",
    overflow: "hidden",
    "@media": {
        "(max-width: 767.98px)": {
            width: "100%",
        },
    },
})

globalStyle(`${activeSwitcher} .mantine-Button-root`, {
    border: 0,
    minWidth: "6.7rem",
    fontWeight: 600,
    "@media": {
        "(max-width: 767.98px)": {
            flex: 1,
            minWidth: 0,
        },
    },
})

globalStyle(`${activeSwitcher} .mantine-Button-root[data-variant='default']`, {
    backgroundColor: "light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-6))",
    color: "light-dark(var(--mantine-color-gray-7), var(--mantine-color-dark-0))",
})

globalStyle(`${activeSwitcher} .mantine-Button-root[data-variant='default']:hover`, {
    backgroundColor: "light-dark(var(--mantine-color-gray-1), var(--mantine-color-dark-5))",
})
