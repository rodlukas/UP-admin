import { createThemeContract, globalStyle, style } from "@vanilla-extract/css"

export const cardVars = createThemeContract({
    courseBackground: "",
})

export const courseHeading = style({
    color: "white",
})

export const courseHeadingItem = style({
    backgroundColor: `${cardVars.courseBackground} !important`,
})

export const lectureCard = style({})

globalStyle(`${lectureCard} h4`, {
    flexGrow: 1,
})

export const lectureFuture = style({
    backgroundColor: "#fff3cd",
})

export const lecturePrepaid = style({
    backgroundColor: "#d4edda",
})

export const cardInfo = style({})

globalStyle(`${cardInfo} > *`, {
    margin: "0 auto 1rem",
    maxWidth: "600px",
})
