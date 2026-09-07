import { globalStyle, style } from "@vanilla-extract/css"

import { courseBand } from "../components/CourseName.css"
import { plainName as groupPlainName } from "../components/GroupName.css"
import { lectureContent, lectureHeading, lectureTitle } from "../components/Lecture.css"
import { statusNoticeWarningStrong, surfacePanel } from "../global/surfaces.css"
import { vars } from "../theme/tokens"

/**
 * Levá hrana obsahu ve sloupci kurzu. Drží ji hlavička sloupce i každá lekce pod ní —
 * jinak název kurzu stojí odsazený a lekce začínají na hraně panelu.
 */
const COLUMN_INSET = "1rem"

/**
 * Hlavička sloupce kurzu — **sytý pruh v barvě kurzu** (`courseBand`), stejně jako pruh
 * hlavičky lekce v diáři. Tichá tečka vedle názvu se v mřížce sloupců ztrácela a kurz
 * nešel poznat na první pohled.
 *
 * Vlastní padding: hlavička záměrně nenese `infoListItem`, aby `& + &` oddělovač
 * nekreslil čáru mezi hlavičkou a první lekcí.
 */
export const courseHeadingItem = style([
    courseBand,
    {
        padding: `0.5rem ${COLUMN_INSET}`,
    },
])

// nadpis uvnitř pruhu píše barvou pruhu — tlumený odstín z palety by na barvě kurzu zmizel
globalStyle(`${courseHeadingItem} h3`, {
    color: "inherit",
})

export const lectureCard = style({
    // Řádek lekce nese zároveň `infoListItem` (kvůli oddělovači `& + &`) i `lecture`
    // (Lecture.css.ts) — oba definují `padding` se shodnou specificitou a pořadí tříd napříč
    // soubory není v bundlu garantované. Padding proto určíme explicitně (!important, stejný
    // pattern jako DashboardDay.css.ts).
    //
    // Vodorovně nula schválně: podbarvení stavu (`lectureFuture`, `lecturePrepaid`,
    // `lectureCanceled`) i šrafování zrušené lekky mají jít přes celou šířku panelu, stejně
    // jako tělo lekce v diáři. Odsazení proto nese až obsah, viz pravidlo níže.
    padding: "0.5rem 0 0.75rem !important",
})

/**
 * Obsah lekce se odsazuje na `COLUMN_INSET`, tedy na tutéž levou hranu jako název kurzu
 * v hlavičce sloupce. Bez toho hlavička stála 1 rem od kraje a lekce pod ní na nule, takže
 * sloupec neměl jednu svislou osu — v diáři přitom hlavička dne i tělo lekce lícují.
 */
globalStyle(`${lectureCard} ${lectureHeading}, ${lectureCard} ${lectureContent}`, {
    paddingRight: COLUMN_INSET,
    paddingLeft: COLUMN_INSET,
})

globalStyle(`${lectureCard} ${lectureTitle}`, {
    flexGrow: 1,
})

export const lectureFuture = style({
    // ztlumeny statusTint v dark rezimu uz nepotrebuje zesvetlovat text
    backgroundColor: vars.statusTint.warning,
})

export const lecturePrepaid = style({
    backgroundColor: vars.statusTint.success,
})

/**
 * Bloky s údaji o klientovi/skupině. Dřív každý blok `margin: 0 auto` a `max-width: 600px`,
 * takže kontakty stály vycentrované v úzkém sloupci a pod titulkem zůstávalo prázdné místo.
 * Dnes zabírají celou šířku svého sloupce a rovnají se doleva k ostatnímu obsahu.
 */
export const cardInfo = style({})

globalStyle(`${cardInfo} > *`, {
    marginBottom: "1rem",
})

export const pastGroup = style({})

globalStyle(`${pastGroup} ${groupPlainName}`, {
    position: "relative",
    display: "inline-block",
})

globalStyle(`${pastGroup} ${groupPlainName}::after`, {
    position: "absolute",
    top: "50%",
    left: 0,
    borderBottom: "2px solid rgb(255 0 0 / 0.6)",
    width: "100%",
    content: '""',
})

/**
 * Panel s klíčovými fakty nad záložkami. Dřív svislý seznam v úzkém sloupci vlevo, vedle
 * kterého zbývala prázdná polovina obrazovky; dnes vodorovný pruh přes celou šířku,
 * popisek nad hodnotou. Sloupce se přizpůsobí šířce okna samy (`auto-fit`).
 */
export const summaryPanel = style([
    surfacePanel,
    {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(13rem, 1fr))",
        gap: "0 1.5rem",
        margin: "0 0 1rem",
        padding: "0.75rem 1rem",
    },
])

export const summaryItem = style({
    padding: "0.25rem 0",
    minWidth: 0,
})

export const summaryLabel = style({
    color: vars.text.subtleMuted,
    fontSize: "1rem",
})

export const summaryValue = style({
    margin: "0.1rem 0 0",
    textWrap: "pretty",
    color: vars.text.primary,
})

/** Záložky karty — odsazení od panelu s klíčovými fakty nad nimi. */
export const tabs = style({
    marginTop: "0.5rem",
})

export const breadcrumbs = style({
    marginTop: "1rem",
    color: vars.text.subtleMuted,
})

/** Poslední článek drobečkové navigace není odkaz — je to místo, kde uživatel stojí. */
export const breadcrumbCurrent = style({
    color: vars.text.muted,
})

export const infoList = style({
    display: "flex",
    flexDirection: "column",
})

export const infoListItem = style({
    padding: "0.5rem 1rem",
    selectors: {
        "& + &": {
            borderTop: vars.borderShort.default,
        },
    },
})

/**
 * Sloupce lekcí po kurzech. Dřív flex s `justify-content: center` a procentními
 * `max-width`, takže dva kurzy stály vycentrované doprostřed plochy s obrovskými
 * okraji po stranách. Dnes mřížka, která sloupce rovná doleva a přidává je podle
 * dostupné šířky.
 *
 * Zlomy musí odpovídat kostře načítání (`<SimpleGrid cols={{ base: 1, md: 2, lg: 3 }}>`
 * v Card.tsx): Mantine `md`/`lg` jsou `62em`/`75em` (výchozí breakpointy, theme je
 * nepřepisuje — stejná konvence jako `MOBILE_QUERY` v Main.tsx). Dřívější natvrdo
 * dané `768px`/`1400px` se s tímhle rozcházely, takže kostra a skutečný obsah
 * přepínaly počet sloupců každá jinde a mřížka se po dotažení dat viditelně přerovnala.
 */
export const lectureColumns = style({
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "1rem",
    "@media": {
        "(min-width: 62em)": { gridTemplateColumns: "repeat(2, minmax(0, 1fr))" },
        "(min-width: 75em)": { gridTemplateColumns: "repeat(3, minmax(0, 1fr))" },
    },
})

/** Sloupec kurzu je ohraničený panel — bez něj by bílé bloky lekcí ležely přímo
 *  na tónované ploše stránky bez hranice. */
export const lectureColumn = style([
    surfacePanel,
    {
        minWidth: 0,
        // ořez ke zaobleným rohům; `clip` místo `hidden` ze stejného důvodu jako u banky
        // a panelu dne — nevytváří zbytečný scroll kontejner
        overflow: "clip",
    },
])

/**
 * Upozornění na neaktivního / dlouho nechodícího klienta. Přebírá sytý notice
 * z Klientů a Skupin (`staleAlert`, `statusNoticeWarningStrong`), aby stejná zpráva
 * vypadala v celé aplikaci stejně.
 */
export const cardNotice = style([
    statusNoticeWarningStrong,
    {
        marginBottom: "1rem",
    },
])
