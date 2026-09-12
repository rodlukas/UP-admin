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
 * `overflow: clip`, ne `hidden` — stejný důvod jako `weekDayCol` v Diary.css.ts: jinak by
 * panel vypadal, že má jiný rádius než banka vedle, a `hidden` by navíc rozbilo
 * `position: sticky` u hlavičky dne.
 */
export const lecturesPanel = style([
    surfacePanel,
    {
        overflow: "clip",
    },
])
