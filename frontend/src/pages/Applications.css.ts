import { style } from "@vanilla-extract/css"

export const course = style({
    selectors: {
        "& + &": {
            marginTop: "1rem",
        },
    },
})

export const courseHeading = style({
    color: "white",
})

export const courseHeadingBadge = style({
    backgroundColor: "white",
    marginLeft: "0.3rem",
})
