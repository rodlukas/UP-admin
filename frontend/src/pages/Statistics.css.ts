import { globalStyle, style } from "@vanilla-extract/css"

export { chartTooltip } from "../components/charts.css"

export const statCard = style({
    border: "1px solid light-dark(#d6dee9, var(--mantine-color-dark-4))",
    borderRadius: "0.6rem",
    boxShadow: "0 14px 30px rgb(15 23 42 / 0.08), 0 4px 12px rgb(15 23 42 / 0.06)",
    backgroundColor: "light-dark(#ffffff, var(--mantine-color-dark-7))",
    padding: "1rem",
    minHeight: "9rem",
})

export const statCardTitle = style({
    marginBottom: "0.5rem",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    color: "light-dark(#64748b, var(--mantine-color-dark-2))",
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
    color: "light-dark(#64748b, var(--mantine-color-dark-2))",
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
    color: "light-dark(#64748b, var(--mantine-color-dark-2))",
    fontSize: "0.875rem",
})

export const sectionTightTop = style({
    marginTop: "0.5rem",
})

export const filterSection = style({
    marginBottom: "1rem",
    paddingBottom: "1rem",
})

export const yearFilterButtons = style({
    display: "flex",
    flexWrap: "wrap",
    gap: "0.25rem",
})

globalStyle(`${yearFilterButtons} > *`, {
    "@media": {
        "screen and (max-width: 575.98px)": {
            flex: 1,
            minWidth: "4.5rem",
        },
    },
})

export const filterHeading = style({
    marginBottom: "0.25rem",
    color: "light-dark(#1f2937, var(--mantine-color-gray-1))",
    fontSize: "0.875rem",
    fontWeight: 600,
})

export const filterHint = style({
    marginBottom: "0.5rem",
    maxWidth: "42rem",
    lineHeight: 1.45,
    color: "light-dark(#64748b, var(--mantine-color-dark-2))",
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

globalStyle(`${metricToggle} button`, {
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
    color: "light-dark(#1f2937, var(--mantine-color-gray-1))",
    fontSize: "1.05rem",
    fontWeight: 600,
})

export const chartCaption = style({
    marginBottom: "0.75rem",
    maxWidth: "48rem",
    lineHeight: 1.45,
    color: "light-dark(#64748b, var(--mantine-color-dark-2))",
    fontSize: "0.8rem",
})

export const chartPanel = style({
    border: "1px solid light-dark(#d6dee9, var(--mantine-color-dark-4))",
    borderRadius: "0.6rem",
    boxShadow: "0 14px 30px rgb(15 23 42 / 0.08), 0 4px 12px rgb(15 23 42 / 0.06)",
    backgroundColor: "light-dark(#ffffff, var(--mantine-color-dark-7))",
    padding: "1rem",
    "@media": {
        "screen and (max-width: 767px)": {
            padding: "0.5rem",
        },
    },
})

export const chartEmpty = style({
    marginBottom: 0,
    color: "light-dark(#64748b, var(--mantine-color-dark-2))",
    fontSize: "0.875rem",
})

export const rankingTable = style({
    minWidth: "24rem",
})
