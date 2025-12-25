import { globalStyle, style } from "@vanilla-extract/css"

globalStyle(".active", {
    fontWeight: "bold",
})

export const navExternalLink = style({
    whiteSpace: "nowrap",
})

globalStyle(`${navExternalLink} svg`, {
    marginLeft: "0.2em",
})

globalStyle(".navbar.navbar-expand-lg .btn", {
    "@media": {
        "(min-width: 992px)": {
            // pri klasickem menu pridej levou mezeru k odhlasovacimu tlacitku
            marginLeft: "0.5rem",
        },
        "(max-width: 991.98px)": {
            // pri hamburger menu pridej horni mezeru k odhlasovacimu tlacitku
            marginTop: "0.5rem",
        },
    },
})
