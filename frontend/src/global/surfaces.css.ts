import { style } from "@vanilla-extract/css"

import { vars } from "../theme/tokens"

/**
 * Sdílené recepty povrchů (karty, panely).
 * Stránky/komponenty je skládají přes `style([surfaceCard, {...vlastní odchylky}])` —
 * samotný vzhled karty (rámeček, rádius, stín, pozadí) má jediný zdroj pravdy tady.
 *
 * Pozn.: žádné TS anotace — vanilla-extract webpack loader vkládá zdroj .css.ts do
 * child kompilace bez transpilace typů, soubor proto musí být parsovatelný jako JS.
 */

/** Základní „karta na povrchu“ — ohraničený zaoblený panel se stínem. */
export const surfaceCard = style({
    border: vars.borderShort.default,
    borderRadius: vars.radius.md,
    boxShadow: vars.shadow.card,
    backgroundColor: vars.bg.surface,
})

/**
 * Karta obalující tabulku/seznam pod nadpisem sekce — `surfaceCard` s oříznutými rohy
 * (aby pruhy tabulky nepřetékaly přes rádius) a drobným odsazením shora. Jediný zdroj
 * pravdy pro stránky Klienti, Skupiny a Nastavení (dříve duplikováno na třech místech).
 */
export const tableSection = style([
    surfaceCard,
    {
        marginTop: "0.25rem",
        overflow: "hidden",
    },
])

/**
 * Měkké stavové boxy (infobox, sekce formuláře) — jemný rámeček, výrazná levá linka
 * a bledé podbarvení z `vars.statusSoft`. Místa použití skládají přes
 * `style([statusNoticeInfo, {...padding a odchylky}])` — padding a typografie
 * zůstávají lokální.
 */
export const statusNoticeInfo = {
    border: vars.statusSoft.info.border,
    borderLeft: vars.statusSoft.info.accent,
    borderRadius: vars.radius.md,
    backgroundColor: vars.statusSoft.info.bg,
}

export const statusNoticeWarning = {
    border: vars.statusSoft.warning.border,
    borderLeft: vars.statusSoft.warning.accent,
    borderRadius: vars.radius.md,
    backgroundColor: vars.statusSoft.warning.bg,
}

export const statusNoticeDanger = {
    border: vars.statusSoft.danger.border,
    borderLeft: vars.statusSoft.danger.accent,
    borderRadius: vars.radius.md,
    backgroundColor: vars.statusSoft.danger.bg,
}
