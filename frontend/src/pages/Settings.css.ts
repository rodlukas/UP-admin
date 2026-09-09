import { globalStyle, style } from "@vanilla-extract/css"

import { surfaceCard } from "../global/surfaces.css"
import { vars } from "../theme/tokens"

// `tableSection` (karta kolem tabulky) je sdílený povrch — žije v global/surfaces.css.ts
export { tableSection } from "../global/surfaces.css"

export const footer = style({})

globalStyle(`${footer} a`, {
    textDecoration: "underline",
    color: "inherit",
})

globalStyle(`${footer} a:hover`, {
    // základní barva odkazu je `inherit`, hover přebarvuje na značkovou primary
    color: vars.colors.primary,
})

export const settingsColumn = style([
    surfaceCard,
    {
        padding: "1rem 1rem 1.1rem",
        height: "100%",
    },
])

globalStyle(`${settingsColumn} h2`, {
    marginBottom: "0.75rem",
})

globalStyle(`${settingsColumn} h3`, {
    marginTop: "0.9rem",
    marginBottom: "0.65rem",
    fontSize: "1.15rem",
})

globalStyle(`${settingsColumn} hr`, {
    opacity: 1,
    marginTop: "0.9rem",
    marginBottom: "0.9rem",
    borderColor: vars.border.default,
})

export const settingsColumnsRow = style({
    marginBottom: "1rem",
})

export const configList = style({
    marginTop: "0.8rem",
    marginBottom: "0.75rem",
})

export const configListItem = style({
    padding: "0.55rem 0",
    selectors: {
        "& + &": {
            borderTop: vars.borderShort.default,
        },
    },
})

export const configRow = style({
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
})

export const configRowLabel = style({
    flex: "0 0 58%",
})

export const configRowControl = style({
    flex: 1,
})

export const emptyMessage = style({
    textAlign: "center",
})

export const footerBlock = style([
    surfaceCard,
    {
        marginTop: "1.1rem",
        padding: "0.9rem 1rem",
    },
])
