import { style } from "@vanilla-extract/css"

export const chartPanel = style({
    border: "1px solid #dee2e6",
    borderRadius: "0.375rem",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1), 0 4px 10px rgba(0, 0, 0, 0.05)",
    backgroundColor: "#fff",
    padding: "0.75rem",
})

export const tooltip = style({
    border: "1px solid #dee2e6",
    borderRadius: "0.375rem",
    boxShadow: "0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)",
    backgroundColor: "#fff",
    padding: "0.5rem 0.75rem",
    lineHeight: 1.5,
    color: "#212529",
    fontSize: "0.8rem",
})
