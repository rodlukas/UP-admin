import { globalStyle, style } from "@vanilla-extract/css"

globalStyle(".navbar .badge", {
    "@media": {
        "(min-width: 992px)": {
            // pri klasickem menu pridej pravou mezeru k badge
            marginRight: "1rem",
        },
    },
})

export const isAuthenticated = style({
    paddingTop: "3.5rem", // 56px
})

globalStyle(".nav-content", {
    maxWidth: "900px",
})

globalStyle(".main a, .modal a", {
    textDecoration: "none",
})

globalStyle(".main a:hover, .modal a:hover", {
    textDecoration: "underline",
})
