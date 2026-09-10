import { createVar, style } from "@vanilla-extract/css"

import { courseColorTint } from "../theme/tokens"

// Dynamická barva a velikost kolečka — hodnoty dosazuje CourseCircle.tsx přes assignInlineVars.
export const circleColor = createVar()
export const circleSize = createVar()

export const courseCircle = style({
    display: "inline-block",
    borderRadius: "50%",
    boxShadow: "0 0 1px 0 rgb(0 0 0 / 0.85)",
    // bez `courseColorTint` by tmavá barva kurzu v tmavém motivu na tmavém pozadí zmizela
    background: courseColorTint(circleColor),
    width: circleSize,
    height: circleSize,
    verticalAlign: "middle",
})
