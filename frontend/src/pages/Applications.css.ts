import { style } from "@vanilla-extract/css"

import { courseBand } from "../components/CourseName.css"
import { surfaceCard } from "../global/surfaces.css"
import { vars } from "../theme/tokens"

export const course = style([
    surfaceCard,
    {
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        selectors: {
            "& + &": {
                marginTop: "1.1rem",
            },
        },
    },
])

export const applicationItem = style({
    transition: "background-color 0.15s ease-in-out",
    borderTop: vars.borderShort.default,
    backgroundColor: vars.bg.surface,
    padding: "0.5rem 1rem",
    selectors: {
        "&:hover": {
            backgroundColor: vars.bg.hover,
        },
    },
})

export const applicationRow = style({
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
})

/**
 * Hlavička sloupce kurzu. Šedé podbarvení odstraněno — v plochém jazyce nese oddělení
 * linka a barvu kurzu levá linka. Ta jde stejným `color-mix` receptem jako `courseDot`
 * (CourseName.css.ts): barva kurzu je uživatelský hex, který by na bílé nebo na tmavé
 * ploše jinak zmizel.
 */
export const courseHeadingItem = style([
    courseBand,
    {
        display: "flex",
        alignItems: "center",
        gap: "0.65rem",
        padding: "0.6rem 1rem",
    },
])

/**
 * Počet zájemců u kurzu — stejný odznak jako pořadové číslo lekce v diáři (`LectureNumber`):
 * tlumený ordinál s podkladem odvozeným z `currentColor`, ne vlastní barva z palety, která by
 * na sytém hexu kurzu zmizela.
 */
export { lectureNumber as courseHeadingCount } from "../components/LectureNumber.css"

export const courseHeading = style({
    marginBottom: 0,
    // barvu nese podklad hlavičky (`courseBand`), text musí psát jeho barvou
    color: "inherit",
    fontSize: "1rem",
    fontWeight: 600,
})

export const applicationMeta = style({
    marginTop: "0.25rem",
    width: "100%",
    "@media": {
        "(min-width: 768px)": {
            flex: "0 0 41.666667%",
            marginTop: 0,
            width: "41.666667%",
        },
    },
})

/**
 * Datum přidání zájemce jako odznak — stejný recept jako `attendanceNumber`
 * (pořadí účasti v diáři): tlumený podklad dá volně stojícímu datu hranici,
 * takže je vidět hned, ne až po přečtení řádku.
 */
export const createdDate = style({
    display: "inline-flex",
    marginRight: "0.35rem",
    borderRadius: vars.radius.pill,
    backgroundColor: vars.bg.control,
    padding: "0.05rem 0.45rem",
    color: vars.text.muted,
    fontWeight: 600,
    fontVariantNumeric: "tabular-nums",
})

/**
 * Poznámka zájemce. Je to obsah, který napsal uchazeč, ne metadata záznamu, proto tmavší
 * `text.muted` místo `text.subtleMuted` — se stejným tlumením jako datum vedle ní by
 * s ním splývala a byla hůř čitelná.
 */
export const applicationNote = style({
    color: vars.text.muted,
})

/**
 * Tužka a koš na řádku zájemce. `align-items: center` je pojistka: obě tlačítka mají mít
 * stejnou velikost (`md` z `EditButton`/`DeleteIconButton`), ale bez zarovnání by se při
 * jakémkoli rozdílu ve výšce zavěsila za horní hranu a jejich glyfy by seděly každý jinde.
 */
export const applicationActions = style({
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: "0.35rem",
    "@media": {
        "(max-width: 767.98px)": {
            justifyContent: "flex-start",
            marginTop: "0.35rem",
        },
    },
})

export const listSection = style({
    marginTop: "0.25rem",
})

export const applicationNameCol = style({
    width: "100%",
    "@media": {
        "(min-width: 768px)": {
            flex: "0 0 25%",
            width: "25%",
        },
        "(max-width: 767.98px)": {
            marginBottom: "0.2rem",
        },
    },
})

export const applicationPhoneCol = style({
    width: "100%",
    "@media": {
        "(min-width: 768px)": {
            flex: "0 0 16.666667%",
            // bez odstupu telefon vizuálně lepí na datum/poznámku vlevo (`applicationMeta`) —
            // sloupce jsou holé flex položky bez mezery mezi sebou, na rozdíl od tabulky
            // v Clients.tsx, kde odstup dávají buňky samy
            paddingLeft: "1rem",
            width: "16.666667%",
        },
        "(max-width: 767.98px)": {
            marginTop: "0.3rem",
        },
    },
})

export const applicationActionsCol = style({
    marginTop: "0.25rem",
    width: "100%",
    "@media": {
        "(min-width: 768px)": {
            flex: "0 0 16.666667%",
            marginTop: 0,
            width: "16.666667%",
        },
    },
})
