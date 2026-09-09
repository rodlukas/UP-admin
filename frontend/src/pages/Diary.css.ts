import { createVar, fallbackVar, style } from "@vanilla-extract/css"

import { surfacePanel } from "../global/surfaces.css"
import { vars } from "../theme/tokens"

export const disabledLink = style({
    cursor: "default",
})

/**
 * Výška šipky odpovídá `md` poli Mantine (`--button-height-md`, 42 px), na které aplikaci
 * přepíná `theme.ts` (výchozí `size` u `Button`) — jinak by šipky vedle tlačítek „Dnes"
 * a „+" v téže liště seděly o 6 px níž. Kdyby se výchozí velikost tlačítek v theme
 * změnila, musí se změnit i tady. Viz obdoba u `ATTENDANCE_CONTROL_SIZE`.
 */
const ARROW_SIZE = "2.625rem"

/**
 * Šipka pro přeskok týdne. Rámeček a rozměr drží odkaz (ne ikona uvnitř) — jinak se
 * velikost ovládacího prvku odvíjí od velikosti glyfu a prostý chevron je proti
 * kroužkovanému výrazně menší.
 */
export const arrowLink = style({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background-color 0.15s ease-in-out, border-color 0.15s ease-in-out",
    border: vars.borderShort.default,
    borderRadius: vars.radius.sm,
    width: ARROW_SIZE,
    height: ARROW_SIZE,
    color: vars.text.muted,
    selectors: {
        "&:hover": {
            borderColor: vars.border.strong,
            backgroundColor: vars.bg.hover,
            color: vars.text.heading,
        },
        // plny outline misto poloprusvitneho focusRing stinu - ring s alpha 0.16 je
        // jako jediny indikator nedostatecny (~1.2:1 vuci pozadi stranky, WCAG 2.4.7);
        // outline navic prezije i forced-colors rezim
        "&:focus-visible": {
            outline: `2px solid ${vars.colors.primary}`,
            outlineOffset: "2px",
        },
    },
})

/** Shluk navigace týdne — šipky a „Dnes" drží u sebe, oddělené od primární akce. */
export const weekNav = style({
    alignItems: "center",
})

/** Samotný glyf uvnitř šipky — rozměr a rámeček řeší `arrowLink` výše. */
export const arrowBtn = style({
    fontSize: "1rem",
})

export const titleDate = style({
    display: "inline-block",
    padding: "0.05rem 0.2rem",
    width: "6ch",
    textAlign: "center",
    color: vars.text.heading,
    fontWeight: 700,
    fontVariantNumeric: "tabular-nums",
})

export const titleDateLong = style({
    width: "10ch",
})

/**
 * Počet skutečně zobrazených dnů. Volné dny se z mřížky vynechávají, takže sloupců bývá
 * míň než pět a zbylé se o uvolněné místo podělí — hodnotu dosazuje `Diary.tsx`.
 */
export const visibleDayCount = createVar()

/** Mezera mezi sloupci dnů. Počítá se s ní i v `maxWidth` mřížky níže. */
const WEEK_GAP = "1rem"

/**
 * Nejširší rozumný sloupec dne.
 *
 * Volné dny se z mřížky vynechávají, takže v týdnu s jediným obsazeným dnem by ten sloupec
 * jinak dostal celou šířku plochy (~1360 px na okně 1440): pruh v barvě kurzu se roztáhne
 * přes celou obrazovku a jméno klienta skončí od stavu docházky přes tisíc pixelů daleko.
 * Sloupec proto roste jen po tuhle mez.
 *
 * 32 rem je měřená hodnota, ne odhad. Nejnáročnější je řádek účasti: jméno klienta (20 px,
 * 99. percentil ze 420 aktivních klientů = 221 px) plus nejširší sada odznaků (upozornění
 * na platbu, platba, dvojciferné pořadí = 132 px), stav docházky (100 px), mezery a odsazení
 * — dohromady 499 px. Hlavička lekce potřebuje méně (390 px), takže rozhoduje účast.
 *
 * Poznámka k účasti se do výpočtu nepočítá: je to uživatelský text libovolné délky a má
 * proto vlastní řádek (`attendanceNote` v Attendances.css.ts), takže o šířku nesoutěží.
 *
 * Plný pětidenní týden to nijak neomezí: pět sloupců by při tomhle stropu potřebovalo přes
 * 2000 px, takže na běžném notebooku se dělí celá šířka jako dosud. Mez se projeví jen tam,
 * kde by se pár sloupců roztáhlo přes celou obrazovku.
 */
const DAY_MAX_WIDTH = "32rem"

/** Tónování řeší plocha stránky (`vars.bg.page`), mřížka jen odsazuje panely dnů. */
export const weekGrid = style({
    padding: "0.75rem",
})

/**
 * Mřížka týdne. Grid (ne flex) proto, že sloupce se musí natahovat na stejnou výšku —
 * jinak by dělicí linka skončila u nejkratšího dne a efekt „linkovaného sešitu" zmizel.
 * Breakpointy odpovídají zbytku aplikace: dny vedle sebe od 992px, 2 od 768px, pod tím
 * pod sebou.
 */
export const weekRow = style({
    display: "grid",
    gridTemplateColumns: "1fr",
    alignItems: "stretch",
    gap: WEEK_GAP,
    "@media": {
        "(min-width: 768px) and (max-width: 991.98px)": {
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        },
        /**
         * Strop šířky drží **jen mřížka dnů**, ne obal — proužek volných dnů pod ní je
         * samostatný a musí mít celou šířku plochy. Když ho strop svíral spolu se sloupci,
         * v týdnu s jedním obsazeným dnem se čtyři volné dny mačkaly do 512 px a lámaly se
         * na dva řádky, přestože vedle zbývalo přes 700 px volného místa.
         */
        "(min-width: 992px)": {
            gridTemplateColumns: `repeat(${fallbackVar(visibleDayCount, "5")}, minmax(0, 1fr))`,
            maxWidth: `calc(${fallbackVar(visibleDayCount, "5")} * ${DAY_MAX_WIDTH} + (${fallbackVar(visibleDayCount, "5")} - 1) * ${WEEK_GAP})`,
        },
    },
})

/**
 * Sloupec dne je ohraničený panel na tónované ploše — den tak má zřetelnou hranici
 * a bílé bloky lekcí uvnitř se od pozadí odlišují.
 *
 * `overflow: clip` je nutný: obsah uvnitř (obal dne, bloky lekcí) má hranaté rohy a bez
 * ořezu vyplní zaoblené rohy panelu, takže roh vypadá odštípnutý. `hidden` použít nejde —
 * udělal by ze sloupce scroll kontejner a rozbil `position: sticky` u hlavičky dne;
 * `clip` scroll kontejner nevytváří, takže lepení zůstává (ověřeno).
 */
export const weekDayCol = style([
    surfacePanel,
    {
        minWidth: 0,
        overflow: "clip",
    },
])

/**
 * Proužek s volnými dny pod mřížkou. Skrytý den musí zůstat vidět (jinak by nebylo poznat,
 * že týden má i další dny) a hlavně musí zůstat dosažitelné přidání lekce na jeho datum —
 * tlačítko „+" u dne je jediná cesta, jak lekci založit s předvyplněným termínem.
 */
export const freeDaysBar = style({
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "0.3rem 1rem",
    // odstup od mřížky: linka nad proužkem seděla přesně na spodní hraně panelu dne,
    // takže vypadala jako odštěpek panelu, ne jako začátek něčeho dalšího
    marginTop: "1rem",
    padding: "0 0.85rem",
    color: vars.text.subtleMuted,
    fontSize: "1rem",
})

export const freeDaysLabel = style({
    color: vars.text.muted,
    fontWeight: 600,
})

export const freeDayItem = style({
    display: "inline-flex",
    alignItems: "center",
    gap: "0.15rem",
})
