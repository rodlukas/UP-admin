import { globalStyle, style } from "@vanilla-extract/css"

import { statusNoticeInfo, statusNoticeWarning } from "../global/surfaces.css"
import { vars } from "../theme/tokens"

export const prepaidLectureCnt = style({
    display: "inline-block",
    marginLeft: "0.55rem",
    width: "5rem",
})

/**
 * Nativní `type="date"`/`type="time"` inputy. Nechávají se nativní (nejlepší UX na dotyku,
 * bez další závislosti a beze změny E2E kroků), jen se sjednocuje jejich vzhled se zbytkem
 * formuláře: pole nese jednu značkovou ikonu vlevo (FA v `leftSection`), takže nativní glyf
 * výběru vpravo je zdvojení a schová se. Afordanci výběru přebírá ta ikona — otevře nativní
 * picker přes `showPicker()` (viz `openNativePicker` v FormLectures.tsx).
 *
 * Samotné pole zůstává textové (`cursor: text`): je to editovatelný vstup po segmentech
 * a klik do něj musí umístit kurzor, ne otevřít kalendář přes celé pole.
 */
export const nativeDateTime = style({})

// Webkit/Blink (Chrome, Safari) — skrytí zdvojeného nativního glyfu výběru vpravo.
globalStyle(`${nativeDateTime} input::-webkit-calendar-picker-indicator`, {
    display: "none",
})

/**
 * Ikona vlevo je spouštěč nativního pickeru, takže je to **doopravdy `<button>`** —
 * stejně jako nativní glyf výběru, který nahrazuje. Klikatelná je díky
 * `leftSectionPointerEvents="all"` na poli (výchozí je `none`).
 */
export const nativeDateTimeTrigger = style({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    border: 0,
    background: "none",
    cursor: "pointer",
    padding: 0,
    color: "inherit",
    ":disabled": {
        cursor: "not-allowed",
    },
})

export const formGroup = style({})

globalStyle(`${formGroup} > div:not(:last-child)`, {
    "@media": {
        "(max-width: 575.98px)": {
            marginBottom: "1rem",
        },
    },
})

export const attendancePaidCol = style({
    textAlign: "center",
    "@media": {
        "(max-width: 575.98px)": {
            textAlign: "left",
        },
    },
})

/**
 * Sekce lekce v plochém jazyce aplikace (bez karet) — shodně s `formSection` ve FormBase.
 * Sousední sekce dělí vlasová linka + bílé místo, ne rámeček.
 */
export const sectionCard = style({
    border: 0,
    backgroundColor: "transparent",
    padding: 0,
    selectors: {
        "& + &": {
            marginTop: "1.4rem",
            borderTop: vars.borderShort.formDivider,
            paddingTop: "1.4rem",
        },
    },
})

export const sectionTitle = style({
    marginBottom: "0.85rem",
    textTransform: "none",
    letterSpacing: "-0.01em",
    color: vars.text.heading,
    fontSize: "1.05rem",
    fontWeight: 700,
})

/** Účastník skupinové lekce — bloky se dělí vlasovou linkou, bez podbarveného rámečku. */
export const attendeeBlock = style({
    padding: 0,
    selectors: {
        "& + &": {
            marginTop: "1rem",
            borderTop: vars.borderShort.formDivider,
            paddingTop: "1rem",
        },
    },
})

export const infoNotice = style([
    statusNoticeInfo,
    {
        padding: "0.75rem 0.9rem",
        color: vars.text.slate,
    },
])

export const warningNotice = style([
    statusNoticeWarning,
    {
        padding: "0.75rem 0.9rem",
        color: vars.text.slate,
    },
])

export const paidLabelPaid = style({
    color: vars.colors.success,
    fontWeight: 700,
})

export const paidLabelUnpaid = style({
    color: vars.colors.danger,
    fontWeight: 700,
})
