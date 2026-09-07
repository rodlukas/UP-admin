import { style } from "@vanilla-extract/css"

import { surfaceCard } from "../global/surfaces.css"
import { vars } from "../theme/tokens"

export const bankWrapper = style([
    surfaceCard,
    {
        // ořez ke zaobleným rohům panelu (tabulka i hlavička uvnitř mají rohy hranaté).
        // `clip`, ne `hidden`: `hidden` by z panelu udělal scroll kontejner, což tu není
        // k ničemu a mění to, ke komu se lepí `position: sticky` uvnitř.
        overflow: "clip",
    },
])

export const bankTitle = style({
    borderBottom: vars.borderShort.default,
    padding: "0.8rem 0.85rem",
})

/**
 * Stav účtu nese jemné `statusTint` podbarvení hlavičky (stejný token jako u stavu
 * lekcí, viz `Lecture.css.ts`) — sytá barva přes celou plochu by na bílé ploše
 * Přehledu přehlušila ostatní obsah. Číslo samotné zůstává v neutrální `heading`
 * barvě. Nedostatek peněz vyžaduje pozornost, proto má navíc ikonu a tooltip
 * u čísla (význam tam nenese jen barva, WCAG 1.4.1); dostatek peněz žádnou akci
 * nevyžaduje, podbarvení samo stačí.
 */
export const bankTitleSuccess = style({
    backgroundColor: vars.statusTint.success,
})

export const bankTitleWarning = style({
    backgroundColor: vars.statusTint.danger,
})

export const bankTitleInner = style({
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "0.5rem",
})

export const bankContent = style({
    padding: "0.8rem",
})

export const bankBalanceLabel = style({
    color: vars.text.subtleMuted,
    fontSize: "1rem",
})

export const bankBalance = style({
    marginBottom: 0,
    letterSpacing: "-0.02em",
    color: vars.text.heading,
    fontSize: "1.9rem",
    fontWeight: 700,
    fontVariantNumeric: "tabular-nums",
})

export const bankActions = style({
    color: vars.text.muted,
})

export const bankDateColumn = style({
    minWidth: "6em",
})

export const bankAmountColumn = style({
    minWidth: "7em",
})

/**
 * Zvýraznění dnešního řádku bledým podbarvením z `statusTint.warning` (stejný recept
 * jako u lekcí) plus výraznou levou linkou — sytý pruh přes celou šířku by byl
 * hlasitější než samotné částky v tabulce, a „dnes" musí být poznat i pro toho,
 * kdo barvu nerozliší.
 * Kontrast textu na light podbarvení #fdf8e7: běžný text 14.79:1, `danger` (red-9) 5.13:1;
 * v dark režimu na mixu #473525: běžný text (dark-0) 9.81:1, `danger` (red-4) 5.03:1.
 */
export const bankRowToday = style({
    boxShadow: `inset 3px 0 0 0 ${vars.colors.warning}`,
    // `&&` zvedá specificitu na 0,2,0: Mantine selektor zebry (`tbody > tr[data-striped]`)
    // má stejnou specificitu jako holá třída, takže by o výsledku rozhodovalo jen pořadí
    // pravidel v bundlu a „dnes" by na podbarveném řádku zmizelo.
    selectors: {
        "&&": {
            backgroundColor: vars.statusTint.warning,
        },
    },
})

/** Text pro chybové/záporné hodnoty — sémantický `danger` token místo raw `red.7`. */
export const bankDangerText = style({
    color: vars.colors.danger,
})

/**
 * Podřádek se zprávou pro příjemce na úzkém displeji. Sloupec „Zpráva pro příjemce" tam
 * kvůli šířce nemá vlastní sloupec (viz `showMessageColumn` v Bank.tsx) — bez podřádku by
 * transakce, jejíž jediný identifikující text nese právě zpráva, zůstala nedosažitelná.
 * Menší tišší písmo a nulový horní padding signalizují, že jde o doplněk řádku nad sebou,
 * ne o samostatnou transakci.
 */
export const bankMessageRow = style({
    paddingTop: 0,
    color: vars.text.subtleMuted,
    fontSize: "0.85em",
})
