import { globalStyle, style } from "@vanilla-extract/css"

import { vars } from "../theme/tokens"

/**
 * Sdílené recepty povrchů.
 * Stránky/komponenty je skládají přes `style([surfaceCard, {...vlastní odchylky}])` —
 * samotný vzhled povrchu má jediný zdroj pravdy tady.
 *
 * Vizuální jazyk: obsah leží v ohraničených panelech na tónované ploše (`vars.bg.page`).
 * Stín ale panely nemají — ten zůstává jen vrstvám, které se nad plochu opravdu zvedají
 * (`surfaceFloating`, plus modaly a dropdowny z Mantine).
 *
 * Rádius má dvě úrovně a drží je `vars.radius`: **plochy** (panel, plovoucí panel, modal)
 * mají `md`, **ovládací prvky** (tlačítka, pole, ikonová tlačítka) `sm` — to je zároveň
 * `defaultRadius` v theme.ts, takže se o ně většinou nemusíš starat. Vnořené stavové boxy
 * (`statusNotice*`) mají `sm`, aby vnitřní roh nebyl větší než vnější.
 *
 * Pozn.: žádné TS anotace — vanilla-extract webpack loader vkládá zdroj .css.ts do
 * child kompilace bez transpilace typů, soubor proto musí být parsovatelný jako JS.
 */

/**
 * Panel obsahu — ohraničený blok na tónované ploše (`vars.bg.page`). Bez rámečku splýval
 * bílý obsah s bílým pozadím a nebylo poznat, kde blok začíná a končí; stín ale nemá,
 * ten zůstává jen plovoucím vrstvám (`surfaceFloating`).
 *
 * Jediný zdroj pravdy pro ohraničení bloků — skládají ho `surfaceCard`, `tableSection`
 * i sloupec dne v diáři.
 */
export const surfacePanel = style({
    border: vars.borderShort.default,
    borderRadius: vars.radius.md,
    backgroundColor: vars.bg.surface,
})

/**
 * Blok obsahu na ploše. Název zůstal z doby, kdy to nebyla karta, ale blok s horní linkou —
 * dnes je to zase ohraničený panel, aby se odlišil od tónované plochy stránky.
 */
export const surfaceCard = style([surfacePanel])

/**
 * Plovoucí panel — jediná vrstva, která smí mít stín, protože se nad plochu skutečně
 * zvedá (přihlašovací karta, tooltip grafu; modaly a dropdowny řeší Mantine sama).
 * Na rozdíl od `surfaceCard` má stín: bez definované hrany vypadá stín jako rozmazaná
 * plocha. Rádius je stejný jako u `surfacePanel` — plovoucí i usazená plocha jsou tentýž
 * druh prvku, jen v jiné vrstvě.
 */
export const surfaceFloating = style({
    border: vars.borderShort.default,
    borderRadius: vars.radius.md,
    boxShadow: vars.shadow.elevated,
    backgroundColor: vars.bg.elevated,
})

/**
 * Sekce s tabulkou/seznamem pod nadpisem. Jediný zdroj pravdy pro stránky Klienti,
 * Skupiny a Nastavení. Ohraničený panel jako `surfaceCard` + vodorovné rolování pro
 * úzká okna.
 */
export const tableSection = style([
    surfacePanel,
    {
        marginTop: "0.25rem",
        overflowX: "auto",
    },
])

/**
 * Tabulka vnořená do panelu (Nastavení má sekci `surfaceCard` a v ní tabulku) už vlastní
 * rámeček nekreslí — jinak by vznikl rámeček v rámečku. Na Klientech a Skupinách je
 * `tableSection` panelem sama za sebe a rámeček si ponechá.
 */
globalStyle(`${surfacePanel} ${tableSection}`, {
    border: 0,
    borderRadius: 0,
})

/**
 * Tabulka na ploše: hlavička je tlumený text s linkou pod sebou a lepí se při rolování.
 * Oddělení řádků nese zebra z `Table` defaults v theme.ts, tady se proto žádné linky
 * mezi řádky nekreslí — linka je jen pod hlavičkou.
 */
export const tableFlat = style({})

// `globalStyle`, ne `selectors` — vanilla-extract v `style()` povoluje jen selektory
// cilici na '&' (vlastni tridu), potomci musi jit takhle.
globalStyle(`${tableFlat} thead th`, {
    position: "sticky",
    zIndex: 2,
    top: 0,
    borderBottom: vars.borderShort.strong,
    backgroundColor: vars.bg.surface,
    color: vars.text.subtleMuted,
    fontWeight: 500,
})

/**
 * Měkké stavové boxy (infobox, sekce formuláře) — jemný rámeček, výrazná levá linka
 * a bledé podbarvení z `vars.statusSoft`. Místa použití skládají přes
 * `style([statusNoticeInfo, {...padding a odchylky}])` — padding a typografie
 * zůstávají lokální.
 */
export const statusNoticeInfo = {
    border: vars.statusSoft.info.border,
    borderLeft: vars.statusSoft.info.accent,
    borderRadius: vars.radius.sm,
    backgroundColor: vars.statusSoft.info.bg,
}

export const statusNoticeWarning = {
    border: vars.statusSoft.warning.border,
    borderLeft: vars.statusSoft.warning.accent,
    borderRadius: vars.radius.sm,
    backgroundColor: vars.statusSoft.warning.bg,
}

/**
 * Sytější varianta `statusNoticeWarning` pro bannery o neaktivním klientovi/skupině
 * (`cardNotice`, `staleAlert`) — viz `vars.statusSoft.warningStrong`, proč tahle
 * varianta smí být sytější, aniž by to porušilo WCAG.
 */
export const statusNoticeWarningStrong = {
    border: vars.statusSoft.warningStrong.border,
    borderLeft: vars.statusSoft.warningStrong.accent,
    borderRadius: vars.radius.sm,
    backgroundColor: vars.statusSoft.warningStrong.bg,
}

export const statusNoticeDanger = {
    border: vars.statusSoft.danger.border,
    borderLeft: vars.statusSoft.danger.accent,
    borderRadius: vars.radius.sm,
    backgroundColor: vars.statusSoft.danger.bg,
}
