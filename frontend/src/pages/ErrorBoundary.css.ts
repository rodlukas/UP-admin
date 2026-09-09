import { globalStyle, style } from "@vanilla-extract/css"

export const description = style({
    marginBottom: "0.75rem",
})

export const actions = style({
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "0.5rem",
})

export const errorDetails = style({
    whiteSpace: "pre-wrap",
})

globalStyle(`${errorDetails} summary`, {
    cursor: "pointer",
})
