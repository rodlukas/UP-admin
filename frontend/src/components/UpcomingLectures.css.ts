import { globalStyle, style } from "@vanilla-extract/css"

import { lectureVars } from "./Lecture.css"

export const list = style({
    margin: 0,
    padding: 0,
    listStyle: "none",
})

/**
 * Pruh hlavičky lekce použitý i tady, ale je to `<Link>` — bez vlastního přebití by
 * na `:hover` zdědil sitewide pravidlo pro textové odkazy (`.main a:hover` v Main.css.ts):
 * podtržení přes celý pruh včetně ikony a barvu textu přebitou na indigo, které na sytém
 * podkladu kurzu ztrácí kontrast (v tmavém režimu skoro mizí). Pruh proto na hoveru
 * vypadá úplně stejně jako v klidu — zvýraznění dává už `lectureBody` pod ním.
 */
export const itemLink = style({
    textDecoration: "none",
})

globalStyle(`.main ${itemLink}:hover`, {
    textDecoration: "none",
    color: lectureVars.courseText,
})

/**
 * Datum a čas mají stejné písmo jako čas v diáři (`lectureTitle` v Lecture.css.ts,
 * skládá ho JSX), tady jen `flexShrink: 0`, aby je při zúžení mačkal až název kurzu
 * (ten má ellipsis), ne ony — zalomení by rozbilo výšku pruhu.
 */
export const itemDate = style({
    flexShrink: 0,
})

export const itemTime = style({
    flexShrink: 0,
})

/**
 * Kdo tu lekci má. Stejná velikost jako jméno klienta v účasti (`clientName`
 * v Attendances.css.ts) — je to kotva řádku, ne doplněk.
 */
export const itemWho = style({
    fontSize: "1.25rem",
    fontWeight: 600,
})
