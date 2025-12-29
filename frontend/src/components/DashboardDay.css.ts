import { createThemeContract, globalStyle, style } from "@vanilla-extract/css"

export const dashboardDayVars = createThemeContract({
    courseBackground: "",
})

export const lectureGroup = style({
    backgroundColor: "#e7e7e7",
})

export const dashboardDayDate = style({
    padding: "0.75rem",
})

export const celebrationNone = style({
    "@media": {
        "(min-width: 576px)": {
            paddingLeft: "2.86875rem",
        },
    },
})

export const lectureCanceledDashboardday = style({})

globalStyle(`${lectureCanceledDashboardday} h4 span::after`, {
    transform: "skewY(10deg)",
})

export const lectureHeading = style({
    backgroundColor: `${dashboardDayVars.courseBackground} !important`,
    color: "white",
})

export const courseName = style({
    flexGrow: 1,
    lineHeight: 0.9,
})

export const lectureNumber = style({
    backgroundColor: "white",
})

export const lectureFree = style({
    paddingTop: "1rem !important",
})

export const dashboardDayWrapper = style({
    position: "relative",
})
