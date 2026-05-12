import { globalStyle, style } from "@vanilla-extract/css"

export const attendances = style({
    padding: 0,
    verticalAlign: "top",
})

export const attendanceNumber = style({})

globalStyle(`${attendances} li`, {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "0.2rem 0.3rem",
    listStyleType: "none",
})

export const attendanceStateWrapper = style({
    flex: "1 0 100%",
})

globalStyle(`${attendances} p`, {
    margin: 0,
})

export const attendancesGroup = style({})

export const clientName = style({
    marginRight: "0.2rem",
    fontSize: "1.25rem",
    fontWeight: 500,
    selectors: {
        [`${attendancesGroup} &`]: {
            fontSize: "1.15rem",
        },
    },
})
