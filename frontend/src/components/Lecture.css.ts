import { globalStyle, style } from "@vanilla-extract/css"

// Společné styly pro lekce používané v Card a DashboardDay

export const lecture = style({
    padding: "0 0 0.75rem",
})

export const lectureCanceled = style({
    backgroundColor: "#f8d7da",
})

globalStyle(`${lectureCanceled} h4 span`, {
    display: "inline-block",
    position: "relative",
})

globalStyle(`${lectureCanceled} h4 span::after`, {
    borderBottom: "2px solid rgb(255 0 0 / 0.6)",
    color: "#fff",
    content: '""',
    position: "absolute",
    right: 0,
    top: "50%",
    width: "100%",
})

export const lectureHeading = style({
    alignItems: "center",
    display: "flex",
    flexFlow: "row",
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
    marginBottom: "0.2rem",
    marginTop: "0.4rem",
})

export const lectureNumber = style({
    marginRight: "0.5rem",
})
