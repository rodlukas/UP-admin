import { style } from "@vanilla-extract/css"

import { vars } from "../theme/tokens"

// Sémantický `warning` token (light #b45309 = 5.02:1 na bílé; yellow-7 by měla jen 2.13:1).
export const warningIcon = style({
    color: vars.colors.warning,
})
