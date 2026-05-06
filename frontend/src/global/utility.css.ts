import { style } from "@vanilla-extract/css"

import { vars } from "../theme/tokens"

/**
 * Globální utility třídy pro běžné jednoslovné styly.
 * Použij místo inline `style={{...}}`, které jsou v tomto codebase zakázané (vanilla-extract only).
 */

export const nowrap = style({
    whiteSpace: "nowrap",
})

export const inlineBlock = style({
    display: "inline-block",
})

export const inlineBlockNowrap = style([inlineBlock, nowrap])

export const bold = style({
    fontWeight: 700,
})

export const semiBold = style({
    fontWeight: 600,
})

export const mb0 = style({
    marginBottom: 0,
})

export const mt05 = style({
    marginTop: "0.5rem",
})

export const ml025 = style({
    marginLeft: "0.25rem",
})

export const ml05 = style({
    marginLeft: "0.5rem",
})

export const mr025 = style({
    marginRight: "0.25rem",
})

export const middle = style({
    verticalAlign: "middle",
})

export const top = style({
    verticalAlign: "top",
})

export const mutedText = style({
    color: vars.text.muted,
})

export const dimmedText = style({
    color: "var(--mantine-color-gray-6)",
})

export const iconAfterText = style([middle, ml05])

export const iconBeforeText = style([middle, mr025])

export const italic = style({
    fontStyle: "italic",
})

export const textCenter = style({
    textAlign: "center",
})

export const textCenterMb0 = style([textCenter, mb0])

export const dimmedTextCenter = style([dimmedText, textCenter])

export const iconInlineX = style({
    marginRight: "0.25rem",
    marginLeft: "0.25rem",
})
