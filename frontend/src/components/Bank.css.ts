import { style } from "@vanilla-extract/css"

import { vars } from "../theme/tokens"

export const bankWrapper = style({
    border: vars.borderShort.default,
    borderRadius: vars.radius.md,
    boxShadow: vars.shadow.card,
    backgroundColor: vars.bg.surface,
    overflow: "hidden",
})

export const bankTitle = style({
    borderBottom: vars.borderShort.default,
    padding: "0.8rem",
})

export const bankTitleInner = style({
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "0.5rem",
})

export const bankContent = style({
    padding: "0.8rem",
})

export const bankTitleText = style({
    marginBottom: 0,
    "@media": {
        "(min-width: 576px)": {
            paddingLeft: "2.3125rem",
        },
    },
})

export const bankActions = style({
    color: vars.text.muted,
})

export const bankDateColumn = style({
    minWidth: "6em",
})

export const bankAmountColumn = style({
    minWidth: "7em",
})

export const bankTitleOk = style({
    backgroundColor: "light-dark(var(--mantine-color-green-1), var(--mantine-color-green-9))",
})

export const bankTitleWarning = style({
    backgroundColor: "light-dark(var(--mantine-color-red-1), var(--mantine-color-red-9))",
})

// Mantine `<Table striped>` aplikuje zebra `tr:nth-of-type(odd/even)` pravidla s vyšší
// specificitou než jedna třída — proto `!important`, aby zvýraznění today-row přebilo zebru.
// Hover styl se pak resi explicitne nize, jinak by `!important` background zrusil i highlightOnHover.
export const bankRowToday = style({
    backgroundColor:
        "light-dark(var(--mantine-color-yellow-1), var(--mantine-color-yellow-9)) !important",
    selectors: {
        "&:hover": {
            backgroundColor:
                "light-dark(var(--mantine-color-yellow-3), var(--mantine-color-yellow-7)) !important",
        },
    },
})
