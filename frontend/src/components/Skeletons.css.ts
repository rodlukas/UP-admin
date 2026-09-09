import { style } from "@vanilla-extract/css"

import { surfacePanel } from "../global/surfaces.css"

/**
 * Kostra ohraničeného panelu. Bere rámeček i rádius ze `surfacePanel`, takže leží na
 * tónované ploše přesně tam, kde pak bude skutečný obsah — bez toho kostra vypadá jako
 * volné šedé pruhy na pozadí a po dotažení dat obsah viditelně „naskočí" do rámečku.
 */
export const panel = style([
    surfacePanel,
    {
        padding: "1rem",
    },
])

/** Řádek kostry tabulky — hodnota vlevo, druhý sloupec vpravo, jako mají skutečné tabulky. */
export const row = style({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "1rem",
})

/** Plocha grafu. Výška odpovídá `chartPanel` ve Statistics.css.ts. */
export const chartArea = style({
    borderRadius: "0.5rem",
})

/** Řádek nadpisu grafové kostry, s místem pro placeholder přepínače metriky vedle něj. */
export const chartSkeletonHeader = style({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "0.5rem",
})
