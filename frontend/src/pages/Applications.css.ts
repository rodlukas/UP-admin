import { createThemeContract, style } from "@vanilla-extract/css"

export const applicationsVars = createThemeContract({
    courseBackground: "",
    badgeColor: "",
})

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

export const courseHeadingItem = style({
    backgroundColor: `${applicationsVars.courseBackground} !important`,
})

export const courseHeadingBadge = style({
    marginLeft: "0.3rem",
    backgroundColor: "white !important",
    color: `${applicationsVars.badgeColor} !important`,
})
