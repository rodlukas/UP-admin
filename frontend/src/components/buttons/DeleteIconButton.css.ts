import { style } from "@vanilla-extract/css"

import { vars } from "../../theme/tokens"

/**
 * Červený glyf popelnice.
 *
 * Barva sedí na **ikoně, ne na tlačítku**: `ActionIcon` si z propu `color` vypisuje
 * `--ai-color` jako inline styl, který by třídu na tlačítku přebil. Mantine varianta
 * `subtle` s `color="red"` navíc sama nestačí — v tmavém motivu z ní vychází red-0
 * (#fff5f5), tedy skoro bílá, a popelnice se nedá odlišit od tužky vedle ní.
 *
 * Tokeny jsou tytéž jako u ikony platby, aby destruktivní akce měla v aplikaci jednu
 * červenou; podbarvení plochy na hover si dál řeší Mantine z `color="red"`.
 */
export const deleteIcon = style({
    transition: "color 0.15s ease-in-out",
    color: vars.colors.danger,
    selectors: {
        "button:hover &": {
            color: vars.colors.dangerHover,
        },
    },
})
