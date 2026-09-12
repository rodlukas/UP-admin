import { createVar, style } from "@vanilla-extract/css"

import { courseColorTint } from "../theme/tokens"

// Dynamická barva a velikost kolečka — hodnoty dosazuje CourseCircle.tsx přes assignInlineVars.
export const circleColor = createVar()
export const circleSize = createVar()

export const courseCircle = style({
    display: "inline-block",
    // `SelectCourse` ho vykresluje jako flex potomka v `<Group wrap="nowrap">` vedle názvu
    // kurzu — bez tohohle by se kolečko u dlouhého názvu v úzkém modalu smrsklo na proužek
    // (tuhle vlastnost měl i zrušený `courseDot`, ze kterého se sem sjednocovalo)
    flexShrink: 0,
    borderRadius: "50%",
    boxShadow: "0 0 1px 0 rgb(0 0 0 / 0.85)",
    // bez `courseColorTint` by tmavá barva kurzu v tmavém motivu na tmavém pozadí zmizela
    background: courseColorTint(circleColor),
    width: circleSize,
    height: circleSize,
    verticalAlign: "middle",
})
