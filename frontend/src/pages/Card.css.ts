import { createThemeContract, globalStyle, style } from "@vanilla-extract/css"

import { plainName as groupPlainName } from "../components/GroupName.css"
import { surfaceCard } from "../global/surfaces.css"
import { vars } from "../theme/tokens"

// Opacita ztmavujícího overlaye hlavičky — sdílená konstanta pro CSS gradient níže
// i pro výpočet barvy textu v Card.tsx (getReadableTextColorWithOverlay); musí být
// jedna hodnota, jinak by se text počítal proti jinému pozadí, než se vykreslí.
export const COURSE_HEADING_OVERLAY_OPACITY = 0.15

export const cardVars = createThemeContract({
    courseBackground: "",
    // Barva textu podle luminance složeného pozadí (kurz + overlay níže) —
    // viz getReadableTextColorWithOverlay; natvrdo bílý text neměl na světlých
    // barvách kurzů dostatečný kontrast.
    courseText: "",
})

export const courseHeading = style({
    marginTop: 0,
    // holé <h4> nese UA default margin-top (~21px), který by uvnitř barevného pruhu
    // přidával prostor jen NAD textem (Mantine preflight resetuje pouze body,
    // index.css.ts styluje jen h1–h3)
    color: cardVars.courseText,
})

export const courseHeadingItem = style({
    backgroundColor: `${cardVars.courseBackground} !important`,
    backgroundImage: `linear-gradient(rgb(15 23 42 / ${COURSE_HEADING_OVERLAY_OPACITY}), rgb(15 23 42 / ${COURSE_HEADING_OVERLAY_OPACITY}))`,
    // vlastní padding: hlavička záměrně nenese `infoListItem`, aby `& + &` oddělovač
    // nekreslil čáru mezi barevnou hlavičkou a první lekcí
    padding: "0.5rem 1rem",
})

export const lectureCard = style({
    // Řádek lekce nese zároveň `infoListItem` (kvůli oddělovači `& + &`) i `lecture`
    // (Lecture.css.ts) — oba definují `padding` se shodnou specificitou a pořadí tříd napříč
    // soubory není v bundlu garantované. Padding proto určíme explicitně (!important, stejný
    // pattern jako DashboardDay.css.ts): vodorovné odsazení dávají vnitřní lectureHeading/
    // lectureContent, řádek má tedy – shodně s lekcemi na Dashboardu – jen spodní mezeru.
    padding: "0 0 0.75rem !important",
})

globalStyle(`${lectureCard} h4`, {
    flexGrow: 1,
})

export const lectureFuture = style({
    // ztlumeny statusTint v dark rezimu uz nepotrebuje zesvetlovat text
    backgroundColor: vars.statusTint.warning,
})

export const lecturePrepaid = style({
    backgroundColor: vars.statusTint.success,
})

export const cardInfo = style({})

globalStyle(`${cardInfo} > *`, {
    margin: "0 auto 1rem",
    maxWidth: "600px",
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

export const clientTopRow = style({
    display: "flex",
    flexWrap: "wrap",
    alignItems: "flex-start",
    gap: "1rem",
    marginBottom: "1rem",
})

export const clientSummaryPanel = style([
    surfaceCard,
    {
        flex: "0 0 auto",
        minWidth: "220px",
        overflow: "hidden",
    },
])

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

export const lectureColumns = style({
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "1rem",
})

export const lectureColumn = style({
    width: "100%",
    "@media": {
        "(min-width: 576px)": { maxWidth: "83.33%" },
        "(min-width: 768px)": { maxWidth: "66.67%" },
        "(min-width: 992px)": { maxWidth: "50%" },
        "(min-width: 1200px)": { maxWidth: "41.67%" },
    },
})

export const lectureColumnNarrow = style({
    "@media": {
        "(min-width: 1200px)": { maxWidth: "33.33%" },
    },
})

export const lecturesTitle = style({
    // Mantine Title má margin: 0 (globální pravidlo pro h1–h3 na něj záměrně nedosáhne,
    // viz index.css.ts) — bez lokálního okraje by nadpis seděl nalepený na sloupcích lekcí
    marginBottom: "0.65rem",
})
