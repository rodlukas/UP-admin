import { style } from "@vanilla-extract/css"

import { surfaceCard } from "../global/surfaces.css"
import { vars } from "../theme/tokens"

export const bankWrapper = style([
    surfaceCard,
    {
        overflow: "hidden",
    },
])

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

// V dark módu nelze použít plné green-9/red-9 pozadí (světlý text by na něm neměl WCAG AA
// kontrast), proto se sytá barva tlumí přes color-mix s povrchem dark-7 — stejně jako u today-row.
// Kontrasty textu: light #1e6b30 na green-1 = 5.72:1; dark green-2 na mixu (#26482d) = 7.97:1.
export const bankTitleOk = style({
    backgroundColor:
        "light-dark(var(--mantine-color-green-1), color-mix(in srgb, var(--mantine-color-green-9) 35%, var(--mantine-color-dark-7)))",
    color: "light-dark(#1e6b30, var(--mantine-color-green-2))",
})

// Kontrasty textu: light #9b1c1c na red-1 = 6.73:1; dark red-2 na mixu (#5e2626) = 8.11:1.
// Ikona `danger` (red-4) má na dark mixu 5.09:1 (ikonám stačí 3:1).
export const bankTitleWarning = style({
    backgroundColor:
        "light-dark(var(--mantine-color-red-1), color-mix(in srgb, var(--mantine-color-red-9) 35%, var(--mantine-color-dark-7)))",
    color: "light-dark(#9b1c1c, var(--mantine-color-red-2))",
})

// Mantine `<Table striped>` aplikuje zebra `tr:nth-of-type(odd/even)` pravidla s vyšší
// specificitou než jedna třída — proto `!important`, aby zvýraznění today-row přebilo zebru.
// Hover styl se pak resi explicitne nize, jinak by `!important` background zrusil i highlightOnHover.
// V dark módu nelze použít plné yellow-9 pozadí (světlý text by měl jen 1.81:1), proto se žlutá
// tlumí přes color-mix s povrchem dark-7. Podíl 25 % (hover 20 %) je zvolen tak, aby i záporné
// částky (`danger` = red-4) měly ≥4.5:1: red-4 na mixu 4.56:1 (hover 4.97:1), běžný text (dark-0)
// 6.38:1 (hover 6.94:1). Light: text #1f2937 na yellow-1 = 13.16:1, red-9 na yellow-1 = 4.89:1;
// hover yellow-2 (yellow-3 by s red-9 měla jen 4.19:1): text 12.38:1, red-9 4.60:1.
export const bankRowToday = style({
    backgroundColor:
        "light-dark(var(--mantine-color-yellow-1), color-mix(in srgb, var(--mantine-color-yellow-9) 25%, var(--mantine-color-dark-7))) !important",
    selectors: {
        "&:hover": {
            backgroundColor:
                "light-dark(var(--mantine-color-yellow-2), color-mix(in srgb, var(--mantine-color-yellow-9) 20%, var(--mantine-color-dark-7))) !important",
        },
    },
})

/** Text pro chybové/záporné hodnoty — sémantický `danger` token místo raw `red.7`. */
export const bankDangerText = style({
    color: vars.colors.danger,
})
