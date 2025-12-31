import { createThemeContract, style } from "@vanilla-extract/css"

export const lectureNumberVars = createThemeContract({
    color: "",
})

export const lectureNumber = style({
    // pouzije CSS custom property pro barvu textu z theme contractu
    color: `${lectureNumberVars.color} !important`,
})
