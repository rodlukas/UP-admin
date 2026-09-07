import { style } from "@vanilla-extract/css"

import { vars } from "../theme/tokens"

import { attendanceIconSlot } from "./Attendances.css"

/**
 * Rozměr i osu bere ze sdíleného `attendanceIconSlot` — platba a „příště platit“ musí
 * v řádku účasti lícovat a vlastní kopie 1,75 rem by se od něj při první úpravě rozešla.
 * Vlastní je jen to, co dělá ze slotu tlačítko.
 */
export const buttonWrap = style([
    attendanceIconSlot,
    {
        border: 0,
        borderRadius: vars.radius.pill,
        backgroundColor: "transparent",
        // klikaci plocha musi zustat pohodlna i pri tissi (mensi) ikone
        padding: "0.15rem",
        selectors: {
            "&:focus-visible": {
                outline: `2px solid ${vars.colors.primary}`,
                outlineOffset: "2px",
            },
            // Pri pending stavu visualne signalizuj „cekej“, ale ponech pointer-events,
            // jinak by Mantine Tooltip prestal reagovat na hover. Kliknuti blokuje handler.
            '&[aria-busy="true"]': {
                opacity: 0.6,
                cursor: "wait",
            },
        },
    },
])

export const attendancePaidButton = style({
    transition: "color 0.15s ease-in-out",
    cursor: "pointer",
})

/**
 * Zaplaceno je **zelené**, hover ztmavuje — stejně jako v masteru, kde barvu dávala
 * bootstrapí `text-success` a hover ji stahoval na tmavší odstín.
 *
 * Zkoušel jsem z toho udělat tichý šedý obrys s tím, že pozornost patří spíš tomu, co
 * zaplacené NENÍ. Uživateli to nevyhovuje: bez najetí byla ikona šedá, takže stav platby
 * nešel přečíst na první pohled a musel se hádat z toho, že není červená. Stav se čte
 * barvou, ne její nepřítomností — tichost by tady byla na úkor informace.
 */
export const attendancePaidButtonSuccess = style({
    color: vars.colors.success,
    selectors: {
        "&:hover": {
            color: vars.colors.successHover,
        },
    },
})

export const attendancePaidButtonDanger = style({
    color: vars.colors.danger,
    selectors: {
        "&:hover": {
            color: vars.colors.dangerHover,
        },
    },
})
