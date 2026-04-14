import { style } from "@vanilla-extract/css"

export { chartTooltip as tooltip } from "./charts.css"

export const chartPanel = style({
    border: "1px solid #dee2e6",
    borderRadius: "0.375rem",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1), 0 4px 10px rgba(0, 0, 0, 0.05)",
    backgroundColor: "#fff",
    padding: "0.75rem",
})
