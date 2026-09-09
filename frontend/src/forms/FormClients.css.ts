import { globalStyle, style } from "@vanilla-extract/css"

import { vars } from "../theme/tokens"

/**
 * Mantine `leftSection` je stavěná jako pevný čtvercový slot pro ikonu, ne pro text —
 * bez vlastní šířky a oddělovače by "+420" splývalo s číslicemi telefonu za ním.
 */
export const phonePrefixSection = style({
    borderRight: vars.borderShort.default,
    width: "3.1rem",
    color: vars.text.muted,
    fontWeight: 500,
})

export const phoneInput = style({})

globalStyle(`${phoneInput} input`, {
    // text jinak začíná hned za prefixem; `--input-padding-inline-start` je Mantine
    // proměnná odvozená od šířky `leftSection` (stejný vzorec jako `PrepaidCounters.css.ts`)
    paddingInlineStart: "calc(var(--input-padding-inline-start) + 0.4rem)",
})
