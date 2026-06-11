import { createThemeContract, style } from "@vanilla-extract/css"

export const courseNameVars = createThemeContract({
    color: "",
    // Barva textu zvolená podle luminance pozadí (getReadableTextColor) — bílý text
    // Mantine `variant="filled"` měl na světlých barvách kurzů kontrast hluboko pod 4.5:1.
    textColor: "",
})

export const courseName = style({
    backgroundColor: `${courseNameVars.color} !important`,
    color: `${courseNameVars.textColor} !important`,
})
