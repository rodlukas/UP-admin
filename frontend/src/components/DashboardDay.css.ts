import { globalStyle, style } from "@vanilla-extract/css"

import { vars } from "../theme/tokens"

import { lectureVars } from "./Lecture.css"

/**
 * Hlavička dne — lepí se při rolování, aby bylo v dlouhém dni pořád vidět, o který jde.
 * Vlastní zaoblení rohů nepotřebuje: panel, ve kterém sedí (`weekDayCol` v diáři,
 * `lecturesPanel` na přehledu), obsah ořezává přes `overflow: clip`.
 */
export const dashboardDayDate = style({
    position: "sticky",
    zIndex: 3,
    top: 0,
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    borderBottom: vars.borderShort.default,
    backgroundColor: vars.bg.surface,
    padding: "0.55rem 0.85rem",
    color: vars.text.heading,
})

/**
 * Hlavička dnešního dne. Přebíjí `dashboardDayDate` výše — stejná specificita, vyhrává
 * pozdější pořadí v tomto souboru.
 *
 * Dnešek značí modré podbarvení hlavičky (horní části dne), ne linka na hraně sloupce
 * ani podtržení data — na rozdíl od linky přes celou výšku sloupce jde o signál jen
 * v místě, kde se skutečně čte "který je dnes den". Váha písma zůstává navíc, aby stav
 * neurčovala jen barva (WCAG 1.4.1).
 */
export const dashboardDayDateToday = style({
    backgroundColor: vars.bg.today,
    fontWeight: 700,
})

/**
 * Nadpis dne bez oslavy. Rovná se doleva jako všechen ostatní obsah, takže mu stačí
 * vyplnit místo, které v hlavičce zbude po tlačítku vpravo.
 */
export const celebrationNone = style({
    flex: 1,
    minWidth: 0,
})

export const dashboardDayDateAction = style({
    flexShrink: 0,
})

export const lectureFree = style({
    // !important: přebíjí padding shorthand třídy `lecture` (Lecture.css.ts) — stejná
    // specificita a pořadí tříd napříč soubory není v bundlu garantované
    paddingTop: "1rem !important",
})

/** Den je plocha, ne karta — obsah drží pohromadě jen linky mezi lekcemi. */
export const dashboardDayWrapper = style({
    position: "relative",
    backgroundColor: vars.bg.surface,
})

export const dashboardDayItem = style({
    transition: "background-color 0.15s ease-in-out",
    borderTop: vars.borderShort.default,
    selectors: {
        "&:hover": {
            backgroundColor: vars.bg.hover,
        },
    },
})

/**
 * Lekce v diáři a přehledu. Při reálné hustotě (8–9 lekcí ve sloupci) splývaly bílé bloky
 * s vlasovou linkou do jednolité stěny, proto tu identitu nese barva ve třech vrstvách:
 *
 * - **kurz** → pruh hlavičky v barvě kurzu,
 * - **typ** → ikona jednotlivec/skupina (`LectureTypeIcon`),
 * - **stav** → zrušená lekce přebíjí pruh i tělo červenou.
 *
 * Blok proto nemá vlastní odsazení — to si drží hlavička a tělo, aby pruh šel přes celou šířku.
 */
export const lectureBlock = style({
    padding: 0,
})

/**
 * Pruh v syté barvě kurzu — barva kurzu má být na první pohled poznat. Odstín se nijak
 * neředí; čitelnost drží barva textu, kterou podle kontrastu dopočítá `contrastingTextColor`
 * (bílá, nebo inkoust) a předá sem přes `lectureVars.courseText`. Proto je odstín i text
 * v obou motivech stejný.
 */
export const lectureHeader = style({
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    background: lectureVars.courseColor,
    padding: "0.4rem 0.85rem",
    color: lectureVars.courseText,
})

/**
 * Zrušená lekce — pruh přebíjí barvu kurzu, stav je důležitější než příslušnost.
 *
 * Je světle červený, ne sytý: celý slot (pruh i tělo) tak drží jednu světlost a přes oba
 * projde jedna úhlopříčka v jednom odstínu (`lectureCanceledStruck`). Se sytým pruhem by
 * škrt na jedné z těch dvou ploch zmizel a musel by být dvoubarevný, což vypadalo rozbitě.
 */
export const lectureHeaderCanceled = style({
    // `statusTint.danger` je jediný zdroj pravdy pro stavové podbarvení lekcí (viz jeho
    // komentář v tokens.ts) — `lectureBodyCanceled` níže z něj vychází taky, díky čemuž
    // drží pruh i tělo jednu světlost (viz komentář výše).
    background: vars.statusTint.danger,
    color: "light-dark(#6d1414, #ffdcdc)",
})

/**
 * Vše v pruhu píše barvou pruhu (`currentColor`) — čas, název kurzu, ikona typu, pořadí
 * i tužka mají jinak vlastní tlumené barvy z palety, které by na sytém podkladu zmizely.
 */
globalStyle(
    `${lectureHeader} h3, ${lectureHeader} h4, ${lectureHeader} span, ${lectureHeader} .mantine-ActionIcon-root`,
    {
        color: "inherit",
    },
)

/** Tužka na sytém pruhu: hover jen prosvětlí podklad, barvu si drží z pruhu. */
globalStyle(`${lectureHeader} .mantine-ActionIcon-root:hover`, {
    backgroundColor: "rgb(255 255 255 / 0.22)",
    color: "inherit",
})

/**
 * Název kurzu v pruhu vyplní zbylé místo a odsune ikonu, pořadí a tužku doprava.
 * Zalamuje se (ne ellipsis) — v pěti sloupcích diáře se delší názvy nevejdou na řádek
 * a useknuté „Bilaterální integr…" už kurz nepojmenuje; radši vyšší pruh než ztráta údaje.
 */
export const lectureHeaderCourse = style({
    flex: 1,
    minWidth: 0,
    overflowWrap: "anywhere",
    lineHeight: 1.25,
    // `currentColor`, ne pevná barva — uvnitř pruhu (`lectureHeader`) musí všechno
    // dědit barvu pruhu, viz globalStyle níže a jeho komentář.
    color: "inherit",
    fontWeight: 600,
})

export const lectureBody = style({
    transition: "background-color 0.15s ease-in-out",
    backgroundColor: vars.bg.surface,
    padding: "0.6rem 0.85rem",
})

export const lectureBodyCanceled = style({
    backgroundColor: vars.statusTint.danger,
})

globalStyle(`${dashboardDayItem}:hover ${lectureBody}`, {
    backgroundColor: vars.bg.hover,
})
