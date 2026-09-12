import { globalStyle, style } from "@vanilla-extract/css"

import { courseBand } from "../components/CourseName.css"
import { plainName as groupPlainName } from "../components/GroupName.css"
import {
    lectureCanceled,
    lectureContent,
    lectureHeading,
    lectureTitle,
} from "../components/Lecture.css"
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
// (`Title order={2}` v Card.tsx renderuje `h2`, ne `h3` — `order` je sémantická úroveň,
// vzhled řeší `size` zvlášť)
globalStyle(`${courseHeadingItem} h2`, {
    color: "inherit",
})

export const lectureCard = style({
    // `&&`: Řádek lekce nese zároveň `infoListItem` (kvůli oddělovači `& + &`) i `lecture`
    // (Lecture.css.ts) — oba definují `padding` se shodnou specificitou a pořadí tříd napříč
    // soubory není v bundlu garantované. Zdvojená třída zvedá specificitu na 0,2,0 a vyhrává
    // napevno bez ohledu na pořadí — na rozdíl od `!important` (viz `lectureFuture`/
    // `lecturePrepaid` níž, ten samý problém, `!important` tam schválně není).
    //
    // Vodorovně nula schválně: podbarvení stavu (`lectureFuture`, `lecturePrepaid`,
    // `lectureCanceled`) i šrafování zrušené lekky mají jít přes celou šířku panelu, stejně
    // jako tělo lekce v diáři. Odsazení proto nese až obsah, viz pravidlo níže.
    selectors: {
        "&&": {
            padding: "0.5rem 0 0.75rem",
        },
    },
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
 * Lekce může být zároveň zrušená i budoucí/předplacená (`Card.tsx` skládá `classNames`
 * z obou) — bez zásahu by šlo o nedeterministickou remízu (tři samostatné třídy, každá
 * specificity 0,1,0, cross-file pořadí v bundlu není garantované). Sloučený selektor
 * (obě třídy na jednom elementu) má vyšší specificitu než kterákoli samotná třída,
 * takže vyhrává napevno bez ohledu na pořadí — na rozdíl od `!important` tu nejde
 * o řešení, které by se samo zamklo, kdyby později přibyla další soupeřící třída.
 * Stav musí vyhrát vždy: je důležitější než příslušnost (viz `lectureHeaderCanceled`
 * v DashboardDay.css.ts).
 */
globalStyle(`${lectureFuture}${lectureCanceled}, ${lecturePrepaid}${lectureCanceled}`, {
    backgroundColor: vars.statusTint.danger,
})

/**
 * Bloky s údaji o klientovi/skupině. Zabírají celou šířku svého sloupce a rovnají se
 * doleva k ostatnímu obsahu — se stropem šířky a `margin: 0 auto` by kontakty stály
 * vycentrované v úzkém sloupci a pod titulkem by zůstávalo prázdné místo.
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
 * Panel s klíčovými fakty nad záložkami — vodorovný pruh přes celou šířku, popisek nad
 * hodnotou. Sloupce se přizpůsobí šířce okna samy (`auto-fit`); svislý seznam v úzkém
 * sloupci vlevo by nechal prázdnou polovinu obrazovky.
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
 * Sloupce lekcí po kurzech — mřížka, která sloupce rovná doleva a přidává je podle
 * dostupné šířky. Flex s `justify-content: center` by dva kurzy postavil doprostřed
 * plochy s obrovskými okraji po stranách.
 *
 * Zlomy musí odpovídat kostře načítání (`<SimpleGrid cols={{ base: 1, md: 2, lg: 3 }}>`
 * v Card.tsx) a proto se zapisují v `em`: Mantine `md`/`lg` jsou `62em`/`75em` (výchozí
 * breakpointy, theme je nepřepisuje — stejná konvence jako `MOBILE_QUERY` v Main.tsx).
 * Natvrdo dané pixelové zlomy se s nimi rozejdou, kostra a skutečný obsah pak přepínají
 * počet sloupců každá jinde a mřížka se po dotažení dat viditelně přerovná.
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

/**
 * Skupina má vždy jen jeden kurz (na rozdíl od klienta, kde jich vedle sebe může
 * stát víc) — jediný sloupec proto nemá cenu srážet na zlomy `lectureColumns` výše,
 * ať využije celou dostupnou šířku panelu.
 */
export const lectureColumnsSingle = style({
    gridTemplateColumns: "1fr",
})

/**
 * Prázdný stav „Žádné lekce" je jediné dítě `lectureColumns` mřížky výše — bez rozpětí přes
 * všechny sloupce by se vešel jen do jedné (nejužší) buňky mřížky, místo aby stál na celou
 * šířku panelu jako všude jinde v appce.
 */
export const lectureEmptyState = style({
    gridColumn: "1 / -1",
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
