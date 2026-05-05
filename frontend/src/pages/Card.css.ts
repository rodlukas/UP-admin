import { createThemeContract, globalStyle, style } from "@vanilla-extract/css"

import { plainName as groupPlainName } from "../components/GroupName.css"

export const cardVars = createThemeContract({
    courseBackground: "",
})

export const courseHeading = style({
    textShadow: "0 1px 2px rgb(0 0 0 / 0.35)",
    color: "white",
})

export const courseHeadingItem = style({
    backgroundColor: `${cardVars.courseBackground} !important`,
    backgroundImage: "linear-gradient(rgb(15 23 42 / 0.15), rgb(15 23 42 / 0.15))",
})

export const lectureCard = style({})

globalStyle(`${lectureCard} h4`, {
    flexGrow: 1,
})

export const lectureFuture = style({
    backgroundColor: "light-dark(#fff8dd, var(--mantine-color-yellow-8))",
})

export const lecturePrepaid = style({
    backgroundColor: "light-dark(#ddf6e4, var(--mantine-color-green-8))",
})

export const cardInfo = style({})

globalStyle(`${cardInfo} > *`, {
    margin: "0 auto 1rem",
    maxWidth: "600px",
})

export const pastGroup = style({})

globalStyle(`${pastGroup} ${groupPlainName}`, {
    position: "relative",
    display: "inline-block",
})

globalStyle(`${pastGroup} ${groupPlainName}::after`, {
    position: "absolute",
    top: "50%",
    left: 0,
    borderBottom: "2px solid rgb(255 0 0 / 0.6)",
    width: "100%",
    content: '""',
})

export const clientTopRow = style({
    display: "flex",
    flexWrap: "wrap",
    alignItems: "flex-start",
    gap: "1rem",
    marginBottom: "1rem",
})

export const clientSummaryPanel = style({
    flex: "0 0 auto",
    border: "1px solid light-dark(#d6dee9, var(--mantine-color-dark-4))",
    borderRadius: "0.55rem",
    boxShadow: "0 14px 30px rgb(15 23 42 / 0.08), 0 4px 12px rgb(15 23 42 / 0.06)",
    backgroundColor: "light-dark(#ffffff, var(--mantine-color-dark-7))",
    minWidth: "220px",
    overflow: "hidden",
})

export const analysisPanel = style({
    flexGrow: 1,
    border: "1px solid light-dark(#d6dee9, var(--mantine-color-dark-4))",
    borderRadius: "0.55rem",
    boxShadow: "0 14px 30px rgb(15 23 42 / 0.08), 0 4px 12px rgb(15 23 42 / 0.06)",
    backgroundColor: "light-dark(#ffffff, var(--mantine-color-dark-7))",
    padding: "0.55rem 0.65rem",
    minWidth: 0,
})

export const infoList = style({
    display: "flex",
    flexDirection: "column",
})

export const infoListItem = style({
    padding: "0.5rem 1rem",
    selectors: {
        "& + &": {
            borderTop: "1px solid light-dark(#e9ecef, var(--mantine-color-dark-4))",
        },
    },
})

export const lectureColumns = style({
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "1rem",
})

export const lectureColumn = style({
    width: "100%",
    "@media": {
        "(min-width: 576px)": { maxWidth: "83.33%" },
        "(min-width: 768px)": { maxWidth: "66.67%" },
        "(min-width: 992px)": { maxWidth: "50%" },
        "(min-width: 1200px)": { maxWidth: "41.67%" },
    },
})

export const lectureColumnNarrow = style({
    "@media": {
        "(min-width: 1200px)": { maxWidth: "33.33%" },
    },
})
