import { createThemeContract, style } from "@vanilla-extract/css"

export const lectureNumberVars = createThemeContract({
    color: "",
})

export const lectureNumber = style({
    color: `${lectureNumberVars.color} !important`,
})
