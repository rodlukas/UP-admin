import { style } from "@vanilla-extract/css"

import { surfacePanel } from "../global/surfaces.css"

export const dashboardSection = style({
    display: "flex",
    flexDirection: "column",
    gap: "0.7rem",
})

/**
 * Panel s dnešními lekcemi. Bankovní účet si ohraničení nese sám (`surfaceCard`
 * v Bank.css.ts), seznam lekcí ne — bez toho by bílé bloky lekcí ležely přímo
 * na tónované ploše bez hranice.
 *
 * `overflow: clip` (ne `hidden`): bez ořezu vyplní hranaté rohy lekcí zaoblené rohy panelu
 * a ten pak vypadá, že má jiný rádius než banka vedle (ta ořez má). `hidden` použít nejde —
 * udělalo by z panelu scroll kontejner a rozbilo `position: sticky` u hlavičky dne;
 * `clip` scroll kontejner nevytváří, takže lepení zůstává.
 */
export const lecturesPanel = style([
    surfacePanel,
    {
        overflow: "clip",
    },
])
