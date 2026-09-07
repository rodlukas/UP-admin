import { style } from "@vanilla-extract/css"

import { vars } from "../theme/tokens"

/**
 * Ikona typu lekce (jednotlivec / skupina). Tlumená barva platí tam, kde ikona leží na
 * ploše panelu (karta klienta). V pruhu hlavičky lekce ji přebíjí `lectureHeader`, který
 * všemu uvnitř nastavuje `color: inherit` — na syté barvě kurzu musí ikona psát barvou pruhu.
 */
export const lectureTypeIcon = style({
    display: "inline-flex",
    flexShrink: 0,
    color: vars.text.muted,
})
