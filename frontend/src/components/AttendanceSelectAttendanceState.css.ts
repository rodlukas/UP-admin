import { style } from "@vanilla-extract/css"

import { vars } from "../theme/tokens"

/**
 * Stav docházky se v diáři „vypisuje na linku": místo ohraničeného boxu jen vlasová
 * linka pod textem. Je to nejčastěji používaný ovládací prvek aplikace a v pěti sloupcích
 * diáře jich na obrazovce bývá několik desítek — orámované boxy z toho dělaly mřížku.
 *
 * Prvek musí zůstat rozpoznatelně interaktivní, proto linka svítí vždy (ne až na hover)
 * a Mantine `Select` si drží vlastní šipku. Ohraničená pole zůstávají ve formulářích,
 * kde se do nich klika napřímo.
 */
/**
 * Vodorovné odsazení nesmí být nulové: focus kreslí kolem pole rámeček a prstenec
 * (globální pravidlo `.mantine-Input-input:focus` v index.css.ts) a bez odsazení seděly
 * těsně na textu. Rádius je tu ze stejného důvodu — prstenec kolem pole s ostrými rohy
 * vypadá jako chyba vykreslení, ne jako stav.
 */
export const ruledInput = style({
    transition: "border-color 0.15s ease-in-out, background-color 0.15s ease-in-out",
    borderBottom: vars.borderShort.strong,
    borderTopLeftRadius: vars.radius.sm,
    borderTopRightRadius: vars.radius.sm,
    // Mantine dává poli `defaultRadius: "sm"` na všechny čtyři rohy a z pole je vidět jen
    // spodní linka — bez vynulování se na obou koncích ohýbala nahoru a vypadala jako
    // nedokreslený rámeček, ne jako linka, na kterou se píše
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    padding: "0 0.5rem",
    color: vars.text.primary,
    fontSize: "1rem",
    selectors: {
        "&:hover": {
            borderBottomColor: vars.text.subtleMuted,
            backgroundColor: vars.bg.hover,
        },
        "&:focus": {
            backgroundColor: vars.bg.hover,
        },
    },
})
