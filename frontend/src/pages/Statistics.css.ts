import { globalStyle, style } from "@vanilla-extract/css"

export { chartTooltip } from "../components/charts.css"

export const statCard = style({
    border: "1px solid #dee2e6",
    borderRadius: "0.375rem",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1), 0 4px 10px rgba(0, 0, 0, 0.05)",
    backgroundColor: "#fff",
    padding: "1rem",
    minHeight: "9rem",
})

export const statCardTitle = style({
    marginBottom: "0.5rem",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    color: "#6c757d",
    fontSize: "0.75rem",
    fontWeight: 600,
})

export const metricValue = style({
    lineHeight: 1,
    fontSize: "2.4rem",
    fontWeight: 700,
})

export const statNote = style({
    marginBottom: "0.5rem",
    lineHeight: 1.45,
    color: "#6c757d",
    fontSize: "0.75rem",
})

export const fetchingOverlay = style({
    transition: "opacity 0.15s ease",
    opacity: 0.5,
    pointerEvents: "none",
})

export const pageLead = style({
    marginBottom: "1rem",
    maxWidth: "42rem",
    lineHeight: 1.5,
    color: "#6c757d",
    fontSize: "0.875rem",
})

export const filterSection = style({
    marginBottom: "1rem",
    paddingBottom: "1rem",
})

export const filterHeading = style({
    marginBottom: "0.25rem",
    color: "#212529",
    fontSize: "0.875rem",
    fontWeight: 600,
})

export const filterHint = style({
    marginBottom: "0.5rem",
    maxWidth: "42rem",
    lineHeight: 1.45,
    color: "#6c757d",
    fontSize: "0.8rem",
})

export const metricToggle = style({
    marginBottom: 0,
    "@media": {
        "screen and (max-width: 767px)": {
            display: "flex",
            width: "100%",
        },
    },
})

globalStyle(`${metricToggle} > .btn`, {
    whiteSpace: "nowrap",
    "@media": {
        "screen and (max-width: 767px)": {
            flex: 1,
            minWidth: 0,
        },
    },
})

export const chartSection = style({
    marginTop: "0.25rem",
})

export const chartTitleRow = style({
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "0.5rem",
    marginBottom: "0.25rem",
    "@media": {
        "screen and (max-width: 767px)": {
            alignItems: "flex-start",
            justifyContent: "flex-start",
        },
    },
})

export const chartTitle = style({
    marginBottom: 0,
    color: "#212529",
    fontSize: "1.05rem",
    fontWeight: 600,
})

export const chartCaption = style({
    marginBottom: "0.75rem",
    maxWidth: "48rem",
    lineHeight: 1.45,
    color: "#6c757d",
    fontSize: "0.8rem",
})

export const chartPanel = style({
    border: "1px solid #dee2e6",
    borderRadius: "0.375rem",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1), 0 4px 10px rgba(0, 0, 0, 0.05)",
    backgroundColor: "#fff",
    padding: "1rem",
    "@media": {
        "screen and (max-width: 767px)": {
            padding: "0.5rem",
        },
    },
})

export const chartEmpty = style({
    marginBottom: 0,
    color: "#6c757d",
    fontSize: "0.875rem",
})
