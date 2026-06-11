import { style } from "@vanilla-extract/css"

import { surfaceCard } from "../global/surfaces.css"
import { vars } from "../theme/tokens"

// Sdílené styly záměrně paralelních stránek Klienti a Skupiny —
// obě stránky mají stejný layout (alert o neaktivních + tabulka v kartě).

export const staleAlert = style({
    margin: "0 auto 1rem",
    border: vars.borderShort.warningSoft,
    boxShadow: "0 8px 18px rgb(120 53 15 / 0.08)",
    maxWidth: "880px",
})

export const tableSection = style([
    surfaceCard,
    {
        marginTop: "0.2rem",
        overflow: "hidden",
    },
])

export const hiddenBelowSm = style({
    "@media": {
        "(max-width: 575px)": {
            display: "none",
        },
    },
})
