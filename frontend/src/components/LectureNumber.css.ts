import { createThemeContract, style } from "@vanilla-extract/css"

export const lectureNumberVars = createThemeContract({
    // Barva kurzu upravená pro kontrast ≥4.5:1 zvlášť pro světlé a tmavé pozadí
    // pilulky (light-dark(white, dark-6), viz DashboardDay.css.ts) —
    // výpočet dělá adjustColorForContrast v LectureNumber.tsx.
    colorLight: "",
    colorDark: "",
})

export const lectureNumber = style({
    color: `light-dark(${lectureNumberVars.colorLight}, ${lectureNumberVars.colorDark}) !important`,
})
