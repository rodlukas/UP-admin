import { globalStyle, style } from "@vanilla-extract/css"

// Společné styly pro lekce používané v Card a DashboardDay

export const lecture = style({
    padding: "0 0 0.75rem",
})

export const lectureCanceled = style({
    backgroundColor: "#f8d7da",
})

globalStyle(`${lectureCanceled} h4 span`, {
    position: "relative",
    display: "inline-block",
})

globalStyle(`${lectureCanceled} h4 span::after`, {
    position: "absolute",
    top: "50%",
    right: 0,
    borderBottom: "2px solid rgb(255 0 0 / 0.6)",
    width: "100%",
    color: "#fff",
    content: '""',
})

export const lectureHeading = style({
    display: "flex",
    flexFlow: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "0.1rem",
    padding: "0 0 0 1rem",
    "@media": {
        "(max-width: 575.98px)": {
            flexWrap: "wrap",
        },
    },
})

globalStyle(`${lectureHeading} h4`, {
    display: "inline-block",
    margin: 0,
})

export const lectureContent = style({
    padding: "0 1rem",
})

globalStyle(`${lectureContent} h5`, {
    marginTop: "0.4rem",
    marginBottom: "0.2rem",
})

export const lectureNumber = style({
    marginRight: "0.5rem",
})
