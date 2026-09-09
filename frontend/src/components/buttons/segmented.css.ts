import { style } from "@vanilla-extract/css"

import { vars } from "../../theme/tokens"

/**
 * Jednotný vzhled segmentového přepínače (Aktivní/Neaktivní, metrika grafu, rozsah roků).
 * Staví na Mantine `SegmentedControl`, ne na `Button.Group` s přepínáním `variant`:
 * `SegmentedControl` obsluhuje i klávesnici a ARIA (radiogroup).
 *
 * Vybraná půlka je **inkoustová, ne indigo** — indigo v aplikaci znamená „hlavní akce
 * a odkaz", a vedle tlačítka „Přidat klienta" si dvě indigo plochy konkurovaly o roli
 * hlavní akce. Filtr není akce, je to stav. Barvy se mezi motivy obracejí, takže vybraná
 * půlka je vždy ta kontrastnější — poměr je mezi indikátorem (`vars.text.primary`) a textem
 * vybrané položky (`vars.bg.page`, viz `segmentedLabel` níže), NE mezi krajními odstíny
 * palety: light #16233a s textem #f4f7fb = 14.63:1, dark #e7ecf4 s textem #141a24 = 14.72:1.
 */
export const segmentedRoot = style({
    /**
     * `theme.ts` má `fontSizes.sm` natvrdo na 1rem (viz komentář tam, „žádný textový obsah
     * nesmí být menší než 1 rem"), takže `--sc-font-size: var(--mantine-font-size-sm)`
     * (Mantine default) dnes už 1rem sám vrací a tenhle override je no-op. Zůstává jako
     * pojistka pro případ, že by se `fontSizes.sm` v budoucnu znovu snížilo — přebíjí se
     * proměnná, ne `font-size` na popisku (to by o vítězi rozhodovalo pořadí pravidel
     * v bundlu), a s ní se dorovná i odsazení, aby text neseděl na hraně.
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
