import { globalStyle, style } from "@vanilla-extract/css"

/** Karta metrik – stejný obal jako panel grafu. */
export const statCard = style({
    border: "1px solid #dee2e6",
    borderRadius: "0.375rem",
    backgroundColor: "#fff",
    padding: "1rem",
    minHeight: "9rem",
})

/** Nadpis karty metrik (shodná typografie se sekcemi). */
export const statCardTitle = style({
    marginBottom: "0.5rem",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    color: "#6c757d",
    fontSize: "0.75rem",
    fontWeight: 600,
})

/** Velké číslo v metrice. */
export const metricValue = style({
    lineHeight: 1,
    fontSize: "2.4rem",
    fontWeight: 700,
})

/** Poznámka v kartě metrik (nad velkým číslem). */
export const statNote = style({
    marginBottom: "0.5rem",
    lineHeight: 1.45,
    color: "#6c757d",
    fontSize: "0.75rem",
})

/** Odtmavení při načítání nových dat. */
export const fetchingOverlay = style({
    transition: "opacity 0.15s ease",
    opacity: 0.5,
    pointerEvents: "none",
})

/** Úvodní odstavec pod nadpisem stránky. */
export const pageLead = style({
    marginBottom: "1rem",
    maxWidth: "42rem",
    lineHeight: 1.5,
    color: "#6c757d",
    fontSize: "0.875rem",
})

/** Blok s filtrem roku. */
export const filterSection = style({
    marginBottom: "1rem",
    paddingBottom: "1rem",
})

/** Nadpis „Rozsah lekcí“. */
export const filterHeading = style({
    marginBottom: "0.25rem",
    color: "#212529",
    fontSize: "0.875rem",
    fontWeight: 600,
})

/** Text nápovědy u filtru. */
export const filterHint = style({
    marginBottom: "0.5rem",
    maxWidth: "42rem",
    lineHeight: 1.45,
    color: "#6c757d",
    fontSize: "0.8rem",
})

/** Přepínač metriky v grafech. */
export const metricToggle = style({
    marginBottom: 0,
    "@media": {
        "screen and (max-width: 767px)": {
            display: "flex",
            width: "100%",
        },
    },
})

globalStyle(`${metricToggle} > .btn`, {
    whiteSpace: "nowrap",
    "@media": {
        "screen and (max-width: 767px)": {
            flex: 1,
            minWidth: 0,
        },
    },
})

/** Blok s grafem – oddělení od karet. */
export const chartSection = style({
    marginTop: "0.25rem",
})

/** Řádek s nadpisem grafu a volitelnou akcí (např. přepínač metriky) vpravo. */
export const chartTitleRow = style({
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "0.5rem",
    marginBottom: "0.25rem",
    "@media": {
        "screen and (max-width: 767px)": {
            alignItems: "flex-start",
            justifyContent: "flex-start",
        },
    },
})

/** Nadpis grafu (pod úrovní H1 stránky). */
export const chartTitle = style({
    marginBottom: 0,
    color: "#212529",
    fontSize: "1.05rem",
    fontWeight: 600,
})

/** Krátký popis pod nadpisem grafu. */
export const chartCaption = style({
    marginBottom: "0.75rem",
    maxWidth: "48rem",
    lineHeight: 1.45,
    color: "#6c757d",
    fontSize: "0.8rem",
})

/** Rámeček kolem samotného grafu (Recharts). */
export const chartPanel = style({
    border: "1px solid #dee2e6",
    borderRadius: "0.375rem",
    backgroundColor: "#fff",
    padding: "1rem",
    "@media": {
        "screen and (max-width: 767px)": {
            padding: "0.5rem",
        },
    },
})

/** Tooltip u grafů (Recharts). */
export const chartTooltip = style({
    border: "1px solid #dee2e6",
    borderRadius: "0.375rem",
    boxShadow: "0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)",
    backgroundColor: "#fff",
    padding: "0.5rem 0.75rem",
    lineHeight: 1.5,
    color: "#212529",
    fontSize: "0.8rem",
})

/** Prázdný stav u grafu. */
export const chartEmpty = style({
    marginBottom: 0,
    color: "#6c757d",
    fontSize: "0.875rem",
})
