import { style } from "@vanilla-extract/css"

import { statusNoticeWarningStrong } from "../global/surfaces.css"
import { vars } from "../theme/tokens"

// Sdílené styly záměrně paralelních stránek Klienti a Skupiny —
// obě stránky mají stejný layout (upozornění na neaktivní + tabulka).

// `tableSection` (sekce s tabulkou) je sdílený povrch — žije v global/surfaces.css.ts
export { tableSection } from "../global/surfaces.css"

/**
 * Upozornění na klienty/skupiny bez lekce. Dřív sytý žlutý banner se stínem, pak
 * měkký notice s tlumeným podkladem a jen barevnou levou linkou — v dark módu z něj
 * ale žlutá zbyla jen na téhle 3px lince a upozornění splývalo s plochou. Dnes
 * `statusNoticeWarningStrong`: celý podklad je žlutý (v obou režimech), bez stínu —
 * stín patří jen tomu, co plave. Zarovnané doleva k obsahu, ne na střed.
 */
export const staleAlert = style([
    statusNoticeWarningStrong,
    {
        // bez stropu sirky: upozorneni se ma zarovnat s tabulkou pod sebou, jinak
        // vypada jako osamocena karta pri levem okraji
        margin: "0 0 1rem",
    },
])

/** Počet položek vedle názvu stránky — údaj, ne stav; nese ho tlumený text, ne pilulka. */
export const titleCount = style({
    color: vars.text.subtleMuted,
    fontSize: "1.125rem",
    fontWeight: 400,
    fontVariantNumeric: "tabular-nums",
})

/** Stránkování se zobrazuje jen u dlouhých seznamů, viz `useDataTable`. */
export const pagination = style({
    justifyContent: "flex-end",
    marginTop: "0.75rem",
})

export const hiddenBelowSm = style({
    "@media": {
        "(max-width: 575.98px)": {
            display: "none",
        },
    },
})
