import { createVar, style } from "@vanilla-extract/css"

export const courseDotColor = createVar()

export const courseDot = style({
    flexShrink: 0,
    borderRadius: "50%",
    backgroundColor: courseDotColor,
    width: 14,
    height: 14,
})
