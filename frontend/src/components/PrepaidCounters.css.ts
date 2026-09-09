import { globalStyle, style } from "@vanilla-extract/css"

import { surfaceCard } from "../global/surfaces.css"
import { vars } from "../theme/tokens"

export const memberCard = style([
    surfaceCard,
    {
        padding: "0.8rem",
        height: "100%",
    },
])

export const memberHeading = style({
    marginBottom: "0.55rem",
    color: vars.text.primary,
    fontSize: "1.02rem",
})

export const prepaidCountersInput = style({
    minWidth: "3.75rem",
    fontWeight: 600,
})

globalStyle(`${prepaidCountersInput} input`, {
    // text jinak začíná hned za levou sekcí a u zvýrazněné (barevné) sekce se o ni opírá;
    // `--input-padding-inline-start` je Mantine proměnná odvozená od šířky té sekce
    paddingInlineStart: "calc(var(--input-padding-inline-start) + 0.4rem)",
})

export const prepaidCountersInputGroupLabel = style({
    // rádius kopíruje pole, aby barevná sekce nepřetékala přes jeho zaoblený roh
    // (pole je `sm` — viz `FormBase.css.ts`)
    borderTopLeftRadius: vars.radius.sm,
    borderBottomLeftRadius: vars.radius.sm,
    backgroundColor: vars.colors.successSolid,
    color: "white",
})
