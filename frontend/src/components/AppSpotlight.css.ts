import { style } from "@vanilla-extract/css"

import { vars } from "../theme/tokens"

/**
 * Postranní sloty řádku (ikona typu vlevo, chip kurzu vpravo). Mantine je tlumí
 * průhledností a na vybraném řádku ji stahuje na 0,7 — chip kurzu by tím vybledl, jenže
 * barva kurzu se neředí, právě aby byl kurz poznat na první pohled. Zbylému obsahu slotů
 * plná sytost nevadí: jsou to ikony, které tím jen získají na čitelnosti.
 *
 * `&&` zvedá specificitu na 0,2,0: Mantine pravidlo je holá třída, takže bez toho by
 * o výsledku rozhodovalo jen pořadí pravidel v bundlu.
 */
export const actionSection = style({
    selectors: {
        "&&": {
            opacity: 1,
        },
    },
})

/** Nápověda kláves v patičce palety. */
export const footer = style({
    display: "flex",
    flexWrap: "wrap",
    gap: "1.25rem",
    color: vars.text.subtleMuted,
})

export const hint = style({
    display: "inline-flex",
    alignItems: "center",
    gap: "0.35rem",
})
