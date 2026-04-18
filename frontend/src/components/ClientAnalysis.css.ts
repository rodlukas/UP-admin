import { style } from "@vanilla-extract/css"

import { chartBaseStyles } from "./charts.css"

export { chartTooltip as tooltip } from "./charts.css"

export const chartPanel = style({
    ...chartBaseStyles,
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1), 0 4px 10px rgba(0, 0, 0, 0.05)",
    padding: "0.75rem",
})
