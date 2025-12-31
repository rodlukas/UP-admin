import { createThemeContract, style } from "@vanilla-extract/css"

export const courseNameVars = createThemeContract({
    color: "",
})

export const courseName = style({
    // pouzije CSS custom property pro barvu pozadi z theme contractu
    backgroundColor: `${courseNameVars.color} !important`,
})
