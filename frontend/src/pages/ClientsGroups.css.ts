import { style } from "@vanilla-extract/css"

import { vars } from "../theme/tokens"

// Sdílené styly záměrně paralelních stránek Klienti a Skupiny —
// obě stránky mají stejný layout (alert o neaktivních + tabulka v kartě).

// `tableSection` (karta kolem tabulky) je sdílený povrch — žije v global/surfaces.css.ts
export { tableSection } from "../global/surfaces.css"

export const staleAlert = style({
    margin: "0 auto 1rem",
    border: vars.borderShort.warningSoft,
    boxShadow: "0 8px 18px rgb(120 53 15 / 0.08)",
    maxWidth: "880px",
})

export const hiddenBelowSm = style({
    "@media": {
        "(max-width: 575.98px)": {
            display: "none",
        },
    },
})
