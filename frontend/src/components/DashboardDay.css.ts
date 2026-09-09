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
    color: vars.text.headingSoft,
})

/**
 * Hlavička dnešního dne. Přebíjí `dashboardDayDate` výše — stejná specificita, vyhrává
 * pozdější pořadí v tomto souboru.
 *
 * Nese jen váhu písma; vlastní značku dne kreslí linka na hraně sloupce
 * (`dashboardDayToday` níže). Váha tu zůstává proto, aby stav neurčovala jen barevná
 * linka (WCAG 1.4.1).
 */
export const dashboardDayDateToday = style({
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

/** Šířka linky, kterou se značí dnešní den. */
const TODAY_MARK_WIDTH = "3px"

/** Den je plocha, ne karta — obsah drží pohromadě jen linky mezi lekcemi. */
export const dashboardDayWrapper = style({
    position: "relative",
    backgroundColor: vars.bg.surface,
})

/**
 * Dnešek značí **linka na levé hraně sloupce**, ne podbarvení hlavičky ani podtržení data.
 * Je to tentýž zápis, jakým pruh navigace značí aktivní položku (`navLinkActive`
 * v Menu.css.ts): linka a váha písma, žádná další barevná plocha. Na rozdíl od značky
 * v hlavičce je vidět z celé výšky sloupce, tedy i když je hlavička odrolovaná.
 *
 * Kreslí ji **vnitřní stín, ne `border`**. Border zabírá místo v boxu, takže sloty lekcí
 * uvnitř končily 3 px od kraje a při hoveru zůstal vlevo nepodbarvený proužek v barvě
 * povrchu. Aby dny v mřížce lícovaly, musely by tu linku mít průhlednou i ostatní dny —
 * a ten proužek by pak nesvítil jen dnes, ale všude. Stín se do rozvržení nepočítá, takže
 * odpadá obojí: sloty jdou přes celou šířku a ostatní dny nepotřebují nic.
 *
 * Deklarováno až za `dashboardDayWrapper` — při shodné specificitě rozhoduje pořadí.
 */
export const dashboardDayToday = style({
    boxShadow: `inset ${TODAY_MARK_WIDTH} 0 0 ${vars.text.primary}`,
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
 * Pruh v syté barvě kurzu — barva kurzu má být na první pohled poznat, stejně jako ji
 * nesla plnobarevná pilulka v předchozím vydání. Odstín se nijak neředí; čitelnost drží
 * barva textu, kterou podle kontrastu dopočítá `contrastingTextColor` (bílá, nebo inkoust)
 * a předá sem přes `lectureVars.courseText`. Proto je odstín i text v obou motivech stejný.
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
    background: `light-dark(#f0c9ce, color-mix(in srgb, var(--mantine-color-red-9) 46%, var(--mantine-color-dark-7)))`,
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
    color: vars.text.heading,
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
