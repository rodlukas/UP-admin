import { globalStyle, style } from "@vanilla-extract/css"

import { vars } from "../theme/tokens"

// Společné styly pro lekce používané v Card a DashboardDay

export const lecture = style({
    padding: "0 0 0.75rem",
})

export const lectureCanceled = style({
    backgroundColor: vars.statusTint.danger,
})

/**
 * Nadpis lekce a jméno skupiny se cílí přes třídy, ne přes `h4`/`h5` — jejich sémantická
 * úroveň se odvíjí od nadpisů kolem (stránka vs. karta), vzhled se ale měnit nesmí.
 */
export const lectureTitle = style({
    display: "inline-block",
    margin: 0,
})

export const lectureSubtitle = style({
    marginTop: "0.4rem",
    marginBottom: "0.2rem",
})

globalStyle(`${lectureCanceled} ${lectureTitle} span`, {
    position: "relative",
    display: "inline-block",
})

globalStyle(`${lectureCanceled} ${lectureTitle} span::after`, {
    position: "absolute",
    top: "50%",
    right: 0,
    borderBottom: "2px solid rgb(255 0 0 / 0.6)",
    width: "100%",
    content: '""',
})

export const lectureHeading = style({
    display: "flex",
    flexFlow: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "0.1rem",
    padding: "0 0 0 1rem",
    "@media": {
        "(max-width: 575.98px)": {
            flexWrap: "wrap",
        },
    },
})

export const lectureContent = style({
    padding: "0 1rem",
})

export const lectureNumber = style({
    marginRight: "0.5rem",
})
