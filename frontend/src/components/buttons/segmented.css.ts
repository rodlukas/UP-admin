import { style } from "@vanilla-extract/css"

import { vars } from "../../theme/tokens"

/**
 * Jednotný vzhled segmentového přepínače (Aktivní/Neaktivní, metrika grafu, rozsah roků).
 * Dřív to byly tři různé `Button.Group` s ručním žonglováním `variant="filled" | "default"`;
 * Mantine na to má `SegmentedControl`, který řeší i klávesnici a ARIA (radiogroup).
 *
 * Vybraná půlka je **inkoustová, ne indigo** — indigo v aplikaci znamená „hlavní akce
 * a odkaz", a vedle tlačítka „Přidat klienta" si dvě indigo plochy konkurovaly o roli
 * hlavní akce. Filtr není akce, je to stav. Barvy se mezi motivy obracejí, takže vybraná
 * půlka je vždy ta kontrastnější: light #16233a s bílým textem = 15.72:1,
 * dark #e7ecf4 s textem #1a2230 = 13.46:1.
 */
export const segmentedRoot = style({
    /**
     * Mantine dává popiskům `--sc-font-size: var(--mantine-font-size-sm)`, tedy 0,875 rem.
     * V aplikaci nesmí být text menší než 1 rem, takže se přebíjí proměnná (ne `font-size`
     * na popisku — to by o vítězi rozhodovalo pořadí pravidel v bundlu) a s ní se dorovná
     * i odsazení, aby text neseděl na hraně.
     */
    border: vars.borderShort.strong,
    backgroundColor: "transparent",
    vars: {
        "--sc-font-size": "1rem",
        "--sc-padding": "0.35rem 0.85rem",
    },
})

export const segmentedIndicator = style({
    boxShadow: "none",
    backgroundColor: vars.text.primary,
})

export const segmentedLabel = style({
    color: vars.text.muted,
    fontWeight: 500,
    selectors: {
        "&[data-active]": {
            color: vars.bg.page,
        },
        "&[data-active]:hover": {
            color: vars.bg.page,
        },
    },
})
