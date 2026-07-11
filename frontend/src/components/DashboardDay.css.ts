import { createThemeContract, globalStyle, style } from "@vanilla-extract/css"

import { surfaceCard } from "../global/surfaces.css"
import { vars } from "../theme/tokens"

// Opacita ztmavujícího overlaye hlavičky — sdílená konstanta pro CSS gradient níže
// i pro výpočet barvy textu v DashboardDay.tsx (getReadableTextColorWithOverlay);
// musí být jedna hodnota, jinak by se text počítal proti jinému pozadí, než se vykreslí.
export const LECTURE_HEADING_OVERLAY_OPACITY = 0.18

export const dashboardDayVars = createThemeContract({
    courseBackground: "",
    // Barva textu podle luminance složeného pozadí (kurz + overlay níže) —
    // viz getReadableTextColorWithOverlay; natvrdo bílý text neměl na světlých
    // barvách kurzů dostatečný kontrast.
    courseText: "",
})

export const lectureGroup = style({
    backgroundColor: vars.bg.muted,
})

export const dashboardDayDate = style({
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    borderBottom: vars.borderShort.default,
    backgroundColor: vars.bg.surface,
    padding: "0.6rem 0.85rem",
    minHeight: "3.25rem",
    color: vars.text.headingSoft,
})

// přebíjí `dashboardDayDate` výše — stejná specificita, vyhrává pozdější pořadí v tomto souboru
export const dashboardDayDateToday = style({
    backgroundColor: "light-dark(var(--mantine-color-indigo-1), var(--mantine-color-indigo-9))",
})

export const celebrationNone = style({
    flex: 1,
    paddingLeft: "2.4rem",
    minWidth: 0,
    textAlign: "center",
})

export const dashboardDayDateAction = style({
    flexShrink: 0,
})

export const lectureCanceledDashboardday = style({})

globalStyle(`${lectureCanceledDashboardday} h4 span::after`, {
    transform: "skewY(10deg)",
})

export const lectureHeading = style({
    backgroundColor: `${dashboardDayVars.courseBackground} !important`,
    backgroundImage: `linear-gradient(rgb(15 23 42 / ${LECTURE_HEADING_OVERLAY_OPACITY}), rgb(15 23 42 / ${LECTURE_HEADING_OVERLAY_OPACITY}))`,
    color: dashboardDayVars.courseText,
})

export const courseName = style({
    flexGrow: 1,
    lineHeight: 0.9,
})

export const lectureNumber = style({
    // !important: přebíjí background Mantine Badge varianty `white` (stejná specificita, pořadí
    // tříd napříč bundly není garantované) — jinak by v dark módu mohl zůstat bílý pill
    backgroundColor: "light-dark(white, var(--mantine-color-dark-6)) !important",
})

export const lectureFree = style({
    // !important: přebíjí padding shorthand třídy `lecture` (Lecture.css.ts) — stejná
    // specificita a pořadí tříd napříč soubory není v bundlu garantované
    paddingTop: "1rem !important",
})

export const dashboardDayWrapper = style([
    surfaceCard,
    {
        position: "relative",
        overflow: "hidden",
    },
])

export const dashboardDayItem = style({
    transition: "background-color 0.15s ease-in-out",
    borderTop: vars.borderShort.default,
    selectors: {
        "&:hover": {
            backgroundColor: vars.bg.hover,
        },
    },
})
