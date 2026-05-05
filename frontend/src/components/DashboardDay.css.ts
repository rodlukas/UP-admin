import { createThemeContract, globalStyle, style } from "@vanilla-extract/css"

export const dashboardDayVars = createThemeContract({
    courseBackground: "",
})

export const lectureGroup = style({
    backgroundColor: "light-dark(#ffffff, var(--mantine-color-dark-7))",
})

export const dashboardDayDate = style({
    borderBottom: "1px solid light-dark(#d6dee9, var(--mantine-color-dark-4))",
    backgroundColor: "light-dark(#ffffff, var(--mantine-color-dark-7))",
    padding: "0.8rem 0.85rem",
    color: "light-dark(#0f172a, var(--mantine-color-gray-1))",
})

export const dashboardDayDateToday = style({
    backgroundColor:
        "light-dark(var(--mantine-color-indigo-1), var(--mantine-color-indigo-9)) !important",
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
    backgroundImage: "linear-gradient(rgb(15 23 42 / 0.18), rgb(15 23 42 / 0.18))",
    textShadow: "0 1px 2px rgb(0 0 0 / 0.46)",
    color: "white",
})

export const courseName = style({
    flexGrow: 1,
    lineHeight: 0.9,
})

export const lectureNumber = style({
    backgroundColor: "light-dark(white, var(--mantine-color-dark-6))",
})

export const lectureFree = style({
    paddingTop: "1rem !important",
})

export const dashboardDayWrapper = style({
    position: "relative",
    border: "1px solid light-dark(#d6dee9, var(--mantine-color-dark-4))",
    borderRadius: "0.55rem",
    boxShadow: "0 14px 30px rgb(15 23 42 / 0.08), 0 4px 12px rgb(15 23 42 / 0.06)",
    backgroundColor: "light-dark(#ffffff, var(--mantine-color-dark-7))",
    overflow: "hidden",
})

export const floatEnd = style({
    float: "right",
})

export const dashboardDayItem = style({
    transition: "background-color 0.15s ease-in-out",
    borderTop: "1px solid light-dark(#d6dee9, var(--mantine-color-dark-4))",
    selectors: {
        "&:hover": {
            backgroundColor: "light-dark(rgb(241 245 249 / 0.85), var(--mantine-color-dark-6))",
        },
    },
})
