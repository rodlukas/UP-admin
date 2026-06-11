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
    color: cardVars.courseText,
})

export const courseHeadingItem = style({
    backgroundColor: `${cardVars.courseBackground} !important`,
    backgroundImage: `linear-gradient(rgb(15 23 42 / ${COURSE_HEADING_OVERLAY_OPACITY}), rgb(15 23 42 / ${COURSE_HEADING_OVERLAY_OPACITY}))`,
})

export const lectureCard = style({})

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

export const analysisPanel = style([
    surfaceCard,
    {
        flexGrow: 1,
        padding: "0.55rem 0.65rem",
        minWidth: 0,
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
