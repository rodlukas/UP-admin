import { style } from "@vanilla-extract/css"

export const chartBaseStyles = {
    border: "1px solid #dee2e6",
    borderRadius: "0.375rem",
    backgroundColor: "#fff",
}

export const chartTooltip = style({
    ...chartBaseStyles,
    boxShadow: "0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)",
    padding: "0.5rem 0.75rem",
    lineHeight: 1.5,
    color: "#212529",
    fontSize: "0.8rem",
})
