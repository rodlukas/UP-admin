import { style } from "@vanilla-extract/css"

import { vars } from "../theme/tokens"

import { railButton } from "./Menu.css"

/**
 * Spouštěč přepínače je v inkoustovém pruhu obyčejná položka — vzhled proto přebírá
 * z `railButton` (Menu.css.ts) a nemá nic vlastního. Sbalený stav se vzhledem neliší —
 * ikona stojí na stejném sloupci v obou šířkách pruhu, mizí jen popisek.
 */
export const toggleButton = railButton

export const dropdown = style({
    border: 0,
    boxShadow: vars.shadow.elevated,
})
