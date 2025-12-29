import { globalStyle, style } from "@vanilla-extract/css"

export const search = style({
    marginLeft: "auto",
    maxWidth: "25rem",
    "@media": {
        "(max-width: 991.98px)": {
            // pri hamburger menu pridej horni mezeru k vyhledavacimu poli a vycentruj ho
            margin: "0.5rem auto",
        },
        "(min-width: 992px)": {
            // pri klasickem menu pridej pravou mezeru k vyhledavacimu poli
            marginRight: "1rem",
        },
    },
})

export const label = style({
    marginBottom: 0,
    color: "#6c757d",
})

export const iconWrapper = style({
    marginRight: 0,
})

globalStyle(`${search} input, ${iconWrapper}`, {
    border: 0,
    backgroundColor: "rgb(255 255 255 / 0.07)",
})

globalStyle(`${search} input`, {
    color: "white",
})

globalStyle(`${search} input::placeholder`, {
    color: "#6c757d",
})

globalStyle(`${search} input:focus`, {
    boxShadow: "none",
    backgroundColor: "rgb(255 255 255 / 0.03)",
    color: "white",
})
