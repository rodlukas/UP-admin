import { createThemeContract, style } from "@vanilla-extract/css"

export const courseNameVars = createThemeContract({
    color: "",
})

export const courseName = style({
    backgroundColor: `${courseNameVars.color} !important`,
})
