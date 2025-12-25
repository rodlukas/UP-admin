import { globalStyle, style } from "@vanilla-extract/css"

export const attendances = style({
    padding: 0,
    verticalAlign: "top",
})

export const attendanceNumber = style({
    selectors: {
        [`${attendances} &`]: {
            marginBottom: "0.3rem",
        },
    },
})

globalStyle(`${attendances} li`, {
    listStyleType: "none",
})

globalStyle(`${attendances} p`, {
    margin: 0,
})

export const attendancesGroup = style({})

export const clientName = style({
    fontSize: "1.25rem",
    fontWeight: 500,
    marginRight: "0.2rem",
    selectors: {
        [`${attendancesGroup} &`]: {
            fontSize: "1.15rem",
        },
    },
})
