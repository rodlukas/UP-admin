import { createThemeContract, globalStyle, style } from "@vanilla-extract/css"

import { vars } from "../theme/tokens"

export const dashboardDayVars = createThemeContract({
    courseBackground: "",
})

export const lectureGroup = style({
    backgroundColor: vars.bg.muted,
})

export const dashboardDayDate = style({
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    borderBottom: vars.borderShort.default,
    backgroundColor: vars.bg.surface,
    padding: "0.6rem 0.85rem",
    minHeight: "3.25rem",
    color: vars.text.headingSoft,
})

export const dashboardDayDateToday = style({
    backgroundColor:
        "light-dark(var(--mantine-color-indigo-1), var(--mantine-color-indigo-9)) !important",
})

export const celebrationNone = style({
    flex: 1,
    paddingLeft: "2.4rem",
    minWidth: 0,
    textAlign: "center",
})

export const dashboardDayDateAction = style({
    flexShrink: 0,
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
    border: vars.borderShort.default,
    borderRadius: vars.radius.md,
    boxShadow: vars.shadow.card,
    backgroundColor: vars.bg.surface,
    overflow: "hidden",
})

export const dashboardDayItem = style({
    transition: "background-color 0.15s ease-in-out",
    borderTop: vars.borderShort.default,
    selectors: {
        "&:hover": {
            backgroundColor: "light-dark(rgb(241 245 249 / 0.85), var(--mantine-color-dark-6))",
        },
    },
})
