import { globalStyle, style } from "@vanilla-extract/css"

import { RAIL_ICON_INSET } from "../global/constants"
import { vars } from "../theme/tokens"

/**
 * Focus ring prvků ležících na inkoustovém pruhu. Výchozí indigo ring Mantine
 * (`.mantine-focus-auto`) i poloprůsvitný stín mají vůči pruhu jen ~2,3–3:1, tedy pod
 * WCAG 1.4.11; blue-3 má na pruhu 8:1 a plný outline přežije i forced-colors režim.
 *
 * Na prvcích Mantine (nesou třídu `mantine-focus-auto`) musí selektor znít
 * `&.mantine-focus-auto:focus-visible` — se samotným `:focus-visible` je specificita
 * shodná a rozhodovalo by pořadí pravidel v bundlu. Prvky bez té třídy (`Link`)
 * použijí `:focus-visible` přímo.
 *
 * Bez TS anotací — vanilla-extract loader vkládá zdroj .css.ts do child kompilace
 * bez transpilace typů (viz global/surfaces.css.ts).
 */
/** Šířka levé linky, kterou se značí aktivní položka. Nese ji každá položka průhledná. */
const ACTIVE_MARK_WIDTH = "3px"

const navbarFocusRing = {
    outline: "2px solid var(--mantine-color-blue-3)",
    outlineOffset: "-2px",
}

/**
 * Položka pruhu. Aktivní stav nese levá linka + váha písma, ne barevná plocha —
 * v pruhu je jediná plocha inkoust a barva by z něj udělala další chrome.
 *
 * Vodorovně stojí ikona na sloupci `RAIL_ICON_INSET`, tedy na téže ose jako značka nahoře.
 *
 * Výška je pevná a odsazení jen vodorovné: obsah položek se liší (u Hledat je navíc `Kbd`,
 * který je vyšší než ikona), takže bez pevné výšky by položky nebyly stejně vysoké.
 * `line-height: 1` brání tomu, aby výšku nafoukl řádek textu.
 */
export const navLink = style({
    display: "flex",
    flexShrink: 0,
    alignItems: "center",
    gap: "0.7rem",
    transition: "background-color 0.15s ease-in-out, color 0.15s ease-in-out",
    borderLeft: `${ACTIVE_MARK_WIDTH} solid transparent`,
    // linka aktivní položky posouvá obsah o svou šířku, proto se od sloupce odečítá
    padding: `0 1rem 0 calc(${RAIL_ICON_INSET} - ${ACTIVE_MARK_WIDTH})`,
    height: "2.6rem",
    textDecoration: "none",
    // bez zalamování: při rozbalení pruhu se popisek jen odkryje, nezalomí se a nereflowuje
    // (ořez řeší `rail` v Main.css.ts)
    lineHeight: 1,
    whiteSpace: "nowrap",
    color: vars.text.rail,
    fontSize: "1rem",
    fontWeight: 500,
    ":hover": {
        backgroundColor: vars.bg.railHover,
        textDecoration: "none",
        color: vars.text.railStrong,
    },
    ":focus-visible": navbarFocusRing,
})

/**
 * Ikona ani popisek se **nesmí zmenšovat**. Během rozbalování je pruh na okamžik užší, než
 * kolik obsah položky potřebuje, a s výchozím `flex-shrink: 1` se v té chvíli ikona stlačí —
 * popisek se za ní posune o pár pixelů a po doběhnutí animace skočí zpátky. Když se nezmenší
 * nic, drží obsah pozici od prvního snímku a přebytek jen ořízne `overflow: clip` na pruhu.
 */
globalStyle(`${navLink} > svg`, {
    flexShrink: 0,
})

// deklarováno až za `navLink` — při shodné specificitě rozhoduje pořadí v souboru
export const navLinkActive = style({
    borderLeftColor: vars.text.railStrong,
    backgroundColor: vars.bg.railActive,
    color: vars.text.railStrong,
    fontWeight: 600,
})

/** Popisek položky — u odkazů je to zároveň jejich přístupný název. */
export const navLabel = style({
    flexShrink: 0,
})

/** Klávesová zkratka u vyhledávání. */
export const navShortcut = style({
    flexShrink: 0,
})

export const navList = style({
    display: "flex",
    flexDirection: "column",
    gap: "1px",
    margin: 0,
    padding: 0,
    width: "100%",
    listStyle: "none",
})

/** Odhlášení a přepínač sbalení jsou tlačítka, ale v pruhu se chovají jako položky. */
export const railButton = style([
    navLink,
    {
        border: 0,
        borderLeft: `${ACTIVE_MARK_WIDTH} solid transparent`,
        background: "none",
        cursor: "pointer",
        width: "100%",
        textAlign: "left",
        selectors: {
            "&.mantine-focus-auto:focus-visible": navbarFocusRing,
        },
    },
])

/** Spouštěč Spotlightu je v pruhu obyčejná položka. */
export const spotlightButton = railButton
