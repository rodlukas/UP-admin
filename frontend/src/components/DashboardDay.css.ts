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
    // `&&`: přebíjí padding shorthand třídy `lecture` (Lecture.css.ts) — stejná specificita
    // a pořadí tříd napříč soubory není v bundlu garantované. Zdvojená třída zvedá specificitu
    // na 0,2,0 a vyhrává napevno bez ohledu na pořadí — na rozdíl od `!important` se tak
    // nezamkne sama, kdyby o padding tady soupeřila i nějaká další třída (stejný pattern
    // jako `Bank.css.ts`/`AppSpotlight.css.ts`).
    selectors: {
        "&&": {
            paddingTop: "1rem",
        },
    },
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
 * Zvýraznění lekce po příchodu z "Nejbližší lekce" (`DashboardDay.tsx`) — žlutá
 * `bg.highlight` (naměřené kontrasty jsou u tokenu). Sama třída nic nekreslí — cílí na ni
 * `lectureHeader` a `lectureBody` níže, protože `lectureBlock` nemá vlastní odsazení
 * a ty dva ho beze zbytku překrývají (`box-shadow` přímo na něm, i `inset` varianta, bylo
 * v prohlížeči ověřeno jako neviditelné — schované pod nimi).
 */
export const lectureHighlighted = style({})

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
    // ŽÁDNÝ `transition`, a to schválně: podklad a barva textu jsou tady svázaná dvojice
    // (`courseText` je dopočítaná právě k `courseColor`) a prohlížeč je interpoluje každou
    // zvlášť. Při rozsvícení i zhasnutí zvýraznění, kde se mění obojí naráz, tak text cestou
    // míjí svůj podklad — změřeno až 1,00:1 v polovině přechodu, tedy úplně neviditelný
    // text. Nepomůže ani animovat jen podklad (1,12:1 hned na začátku); jediné bezpečné je
    // obojí přepnout skokem, aby existovaly jen krajní, změřené stavy.
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
 * Tužka na pruhu zrušené lekce má vlastní hover overlay — stejná specificita jako pravidlo
 * výše (dvě třídy + `:hover`), vyhrává pozdější pořadí v tomto souboru (stejná technika jako
 * `dashboardDayDateToday` výše). `lectureHeaderCanceled` je světlý pastel (`statusTint.danger`
 * v light módu skoro bílý, viz tokens.ts), takže bílý 22% overlay z obecného pravidla je na
 * něm prakticky neviditelný — tady proto tmavší.
 */
globalStyle(`${lectureHeaderCanceled} .mantine-ActionIcon-root:hover`, {
    backgroundColor: "light-dark(rgb(0 0 0 / 0.08), rgb(255 255 255 / 0.22))",
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
    // Jen `background-color`, nikdy `color`: v těle si text nese vlastní barvy z palety
    // a ty se zvýrazněním nemění, takže tu žádná svázaná dvojice jako v hlavičce není.
    // Tenhle přechod obsluhuje hover i rozsvícení/zhasnutí zvýraznění — prohlížeč ho bere
    // ze stavu PO změně třídy, takže pravidlo na zvýraznění by na zhasínání stejně nedosáhlo.
    transition: "background-color 0.15s ease-in-out",
    backgroundColor: vars.bg.surface,
    padding: "0.6rem 0.85rem",
    "@media": {
        "(prefers-reduced-motion: reduce)": {
            transition: "none",
        },
    },
})

export const lectureBodyCanceled = style({
    backgroundColor: vars.statusTint.danger,
})

/**
 * Podbarvení hlavičky i těla při zvýraznění. Dvě třídy ve spojeném selektoru
 * (specificita 0,2,0) úmyslně přebíjejí barvu zrušené lekce
 * (`lectureHeaderCanceled`/`lectureBodyCanceled`, obě jen 0,1,0) — zvýraznění má po dobu
 * doznívání přednost. Na hover to ale nestačí: `.dashboardDayItem:hover .lectureBody:not(...)`
 * má 0,4,0, takže by u lekce pod kurzorem přebil tělo zpátky na šedou a zvýraznění by
 * zůstalo jen na hlavičce. Hoverové pravidlo proto zvýrazněnou lekci vylučuje `:not()`
 * (viz jeho komentář níž).
 *
 * Barva je `bg.highlight`, ne `statusSoft.warningStrong` — ten je určený jen pro plochy
 * s automatickou černou/bílou Mantine `Alert`u a v dark módu je to neprůhledná ambra, na
 * které by odkaz i docházka v těle spadly pod WCAG AA. Naměřené hodnoty jsou u tokenu.
 *
 * `color` na hlavičce navíc: děti pruhu dědí `currentColor` (viz globalStyle u
 * `lectureHeader` výše), který by jinak zůstal spočítaný proti PŮVODNÍ barvě kurzu
 * (`lectureVars.courseText`) — u tmavého kurzu tedy bílý text na světlém podkladu, pod
 * WCAG. Tělo vlastní `color` nemá (odkazy a časy si nesou barvu samy), proto ho nepotřebuje
 * — a právě proto na něj musí podklad brát ohled.
 *
 * Přechody tu schválně NEJSOU: prohlížeč je bere ze stavu PO změně třídy, takže pravidlo
 * odsud by platilo jen na rozsvícení a na zhasínání už ne. Řídí je proto vlastní pravidla
 * obou prvků — tělo krátkým přechodem podkladu, hlavička vůbec (viz její komentář).
 */
globalStyle(`${lectureHighlighted} ${lectureHeader}`, {
    backgroundColor: vars.bg.highlight,
    color: "light-dark(#000, #fff)",
})
globalStyle(`${lectureHighlighted} ${lectureBody}`, {
    backgroundColor: vars.bg.highlight,
})

/**
 * Tužka na zvýrazněné hlavičce potřebuje vlastní hover overlay ze stejného důvodu jako
 * u zrušené lekce výš: v light módu je zvýraznění světlý pastel (#fff3bf) a bílý 22%
 * overlay z obecného pravidla je na něm neviditelný (1,03:1 proti podkladu). Specificita
 * 0,4,0 přebíjí obecné pravidlo i variantu pro zrušenou lekci (obě 0,3,0), takže
 * zvýrazněná zrušená lekce dostane tuhle.
 */
globalStyle(`${lectureHighlighted} ${lectureHeader} .mantine-ActionIcon-root:hover`, {
    backgroundColor: "light-dark(rgb(0 0 0 / 0.08), rgb(255 255 255 / 0.22))",
    color: "inherit",
})

/**
 * `:not()` (ne jen pozdější pořadí v souboru): `.dashboardDayItem:hover .lectureBody` má vyšší
 * specificitu (tři úrovně) než samotné `.lectureBodyCanceled` (jedna) i než zvýraznění
 * `.lectureHighlighted .lectureBody` (dvě), takže by hover obě barvy přebil zpátky na šedou
 * bez ohledu na pořadí v souboru — vyloučení je proto jediný spolehlivý způsob, jak těmhle
 * dvěma stavům hover nesahat na barvu vůbec. U zrušené lekce sedí `:not()` na těle, u
 * zvýraznění na obalu, protože `lectureHighlighted` nese celý blok lekce.
 */
globalStyle(
    `${dashboardDayItem}:not(${lectureHighlighted}):hover ${lectureBody}:not(${lectureBodyCanceled})`,
    {
        backgroundColor: vars.bg.hover,
    },
)
