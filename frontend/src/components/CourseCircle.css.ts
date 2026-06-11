import { createVar, style } from "@vanilla-extract/css"

// Dynamická barva a velikost kolečka — hodnoty dosazuje CourseCircle.tsx přes assignInlineVars.
export const circleColor = createVar()
export const circleSize = createVar()

export const courseCircle = style({
    display: "inline-block",
    borderRadius: "50%",
    boxShadow: "0 0 1px 0 rgb(0 0 0 / 0.85)",
    background: circleColor,
    width: circleSize,
    height: circleSize,
    verticalAlign: "middle",
})
