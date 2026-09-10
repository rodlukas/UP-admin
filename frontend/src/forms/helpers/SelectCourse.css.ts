import { createVar, style } from "@vanilla-extract/css"

import { courseColorTint } from "../../theme/tokens"

export const courseDotColor = createVar()

export const courseDot = style({
    flexShrink: 0,
    borderRadius: "50%",
    // bez `courseColorTint` by tmavá barva kurzu v tmavém motivu na tmavém pozadí zmizela
    backgroundColor: courseColorTint(courseDotColor),
    width: 14,
    height: 14,
})
