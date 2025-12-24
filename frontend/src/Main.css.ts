import { globalStyle } from "@vanilla-extract/css"

globalStyle(".navbar .badge", {
    "@media": {
        "(min-width: 992px)": {
            // pri klasickem menu pridej pravou mezeru k badge
            marginRight: "1rem",
        },
    },
})

globalStyle(".nav-content", {
    maxWidth: "900px",
})
