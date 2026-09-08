import { createTheme, MantineColorsTuple } from "@mantine/core"

import { vars } from "./tokens"

const FONT_FAMILY =
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif'

/**
 * Výchozí přechod modálních oken. Sdílí ho theme default níže a BaseModal —
 * `transitionProps` předané Modalu totiž theme default nahrazují celé (ne po klíčích),
 * takže např. samotné `{ onExited }` by modal tiše přepnulo na Mantine default "fade-down".
 */
export const MODAL_TRANSITION_PROPS = { transition: "fade", duration: 200 } as const

/**
 * Tmavá paleta přebarvená z neutrální šedé do inkoustové škály — tmavý režim je tmavší
 * verze téhož modročerného inkoustu, ne šedý mód. Přebarvení jde přes Mantine paletu
 * (ne přes vlastní hexy v tokenech), aby stejný odstín držely i komponenty, které si
 * `--mantine-color-dark-N` berou samy: Modal, Input, Menu, Popover.
 *
 * Mantine používá dark-7 jako pozadí těla, dark-6 pro plovoucí povrchy a inputy,
 * dark-4 pro linky a dark-0/1 pro text. Kontrasty na dark-7 (#1a2230): dark-0 13.46:1,
 * dark-1 7.13:1, dark-2 5.35:1. **dark-3 má jen 3.52:1 — je to odstín pro linky a ikony,
 * ne pro text.**
 */
const DARK_INK: MantineColorsTuple = [
    "#e7ecf4",
    "#a3aec1",
    "#8b96a9",
    "#6b7789",
    "#3a4453",
    "#2b3544",
    "#26303f",
    "#1a2230",
    "#141a24",
    "#0b0f16",
]

export const theme = createTheme({
    primaryColor: "indigo",
    colors: { dark: DARK_INK },
    // rádius drží plochý jazyk: zaoblení je znak karty, tady je jen na ovládacích prvcích
    defaultRadius: "sm",
    // Mantine přechody (modaly, tooltipy, …) respektují prefers-reduced-motion;
    // vlastní transformace v *.css.ts musí mít media query zvlášť.
    respectReducedMotion: true,
    fontFamily: FONT_FAMILY,
    /**
     * **Žádný textový obsah nesmí být menší než 1 rem.**
     *
     * Nestačí to hlídat u volání: Mantine má `var(--mantine-font-size-sm)` natvrdo ve
     * vlastním CSS tooltipů, tabů, položek menu i notifikací, takže tam se `size` prop
     * vůbec nedostane. Jediné místo, kde to jde ošetřit naráz, je škála — `xs` a `sm`
     * proto sedí na 1 rem. Že tím tři stupně splynou, je záměr: menší písmo se v téhle
     * aplikaci nepoužívá, takže ty stupně nemají co rozlišovat.
     *
     * Výchozí Mantine `sm` (0,875 rem = 14 px) je pro provozní použití aplikace příliš
     * malé — uživatelka v ní čte údaje o klientech a lekcích celý den.
     */
    fontSizes: {
        xs: "1rem",
        sm: "1rem",
    },
    headings: {
        fontFamily: FONT_FAMILY,
        sizes: {
            h1: { fontSize: "1.75rem", fontWeight: "600" },
            h2: { fontSize: "1.5rem", fontWeight: "600" },
            h3: { fontSize: "1.35rem", fontWeight: "600" },
        },
    },
    focusRing: "auto",
    components: {
        Modal: {
            defaultProps: {
                centered: true,
                zIndex: 1050,
                overlayProps: { backgroundOpacity: 0.55, blur: 3 },
                transitionProps: MODAL_TRANSITION_PROPS,
            },
        },
        /**
         * Textové prvky obsahu jedou na `md` (1 rem), ne na výchozím Mantine `sm`
         * (0,875 rem = 14 px) — obecné pravidlo aplikace: text v obsahu nesmí být menší
         * než 1 rem.
         *
         * `ActionIcon` tu schválně není — u ikonového tlačítka je `size` rozměr plochy,
         * ne velikost písma, a řídí ho výška řádku v tabulce (viz `DeleteIconButton`).
         */
        Button: {
            defaultProps: { size: "md" },
            styles: {
                root: { fontWeight: 500 },
            },
        },
        TextInput: {
            defaultProps: { size: "md" },
        },
        Textarea: {
            defaultProps: { size: "md" },
        },
        Checkbox: {
            defaultProps: { size: "md" },
        },
        Pagination: {
            defaultProps: { size: "md" },
        },
        Alert: {
            defaultProps: { size: "md" },
        },
        Tooltip: {
            defaultProps: {
                withinPortal: true,
                zIndex: 1300,
            },
        },
        Table: {
            defaultProps: {
                size: "md",
                highlightOnHover: true,
                // bez vnějšího rámečku — tabulka leží na ploše (viz `tableFlat`
                // v global/surfaces.css.ts, kde má hlavička linku a lepí se při rolování)
                withTableBorder: false,
                // Řádky odděluje zebra, ne linky: v provozních tabulkách s pěti sloupci
                // se řádek trasuje přes celou šířku a podbarvení to unese samo. Linky
                // navíc by oddělovaly dvakrát a plochu jen zahustily, proto jdou ven
                // (`withRowBorders`) — linka pod hlavičkou zůstává.
                //
                // Odstíny nejdou z Mantine defaultů (`gray-0`/`gray-1`): jsou neutrálně
                // šedé, tedy mimo modře tónovanou paletu, a krok zebry 1.054:1 je pod
                // hranicí, kdy si ho oko při skenování všimne. Zebra proto nese tón
                // plochy stránky a hover má vlastní token, aby byl krok i proti zebře —
                // naměřené kontrasty viz `bg.page` a `bg.tableRowHover` v tokens.ts.
                striped: "odd",
                stripedColor: vars.bg.page,
                highlightOnHoverColor: vars.bg.tableRowHover,
                withRowBorders: false,
                // `xs`, ne `sm`: tabulka klientu ma stovky radku a je to provozni nastroj —
                // vzdusnejsi radky vypadaly lip na screenshotu a hur pri praci
                verticalSpacing: "xs",
            },
        },
        TableTh: {
            defaultProps: {
                scope: "col",
            },
        },
        Title: {
            styles: {
                // negativní prostrkání drží nadpisy kompaktní; kladné je znak
                // „vzdušného" marketingového layoutu, ne provozního nástroje
                root: { letterSpacing: "-0.005em" },
            },
        },
        // Comboboxy v Mantine 9 (Select, MultiSelect, Autocomplete, …) sdílí Popover
        // přes comboboxProps. V modalu (zIndex 1050) by jinak dropdown mizel pod overlayem.
        // `keepMounted: false`: zavřený dropdown se odpojí z DOM — jinak každý Select
        // nechává v dokumentu skrytou sadu [role="option"], což nafukuje DOM a rozbíjí
        // Selenium E2E kroky čekající na viditelnost první nalezené volby.
        Popover: {
            defaultProps: {
                withinPortal: true,
                zIndex: 1100,
            },
        },
        Select: {
            defaultProps: {
                size: "md",
                comboboxProps: { withinPortal: true, zIndex: 1100, keepMounted: false },
            },
        },
        MultiSelect: {
            defaultProps: {
                size: "md",
                comboboxProps: { withinPortal: true, zIndex: 1100, keepMounted: false },
            },
        },
        /**
         * Mantine defaultně kreslí pily vybraných položek variantou "default" — jen výplň
         * (gray-1 na bílém inputu, ~1.1:1 kontrast, prakticky nerozeznatelné; v tmavém
         * režimu dark-7 na dark-6 vychází o něco lépe, ale pořád jen samotnou výplní).
         * Zkoušel jsem výplň nahradit `bg.control`, ale v tmavém režimu je to o barvu
         * SVĚTLEJŠÍ než dark-7 default (dark-5 vs dark-6 okolí = 1.08:1), tedy regrese
         * oproti současným 1.2:1. Řešení je stejné jako u `SegmentedControl`
         * (`segmented.css.ts`) — viditelnost nedávat na výplň, ale na `border.strong`
         * (light 1.51:1, dark 2.93:1 vůči okolí), který funguje v obou režimech.
         */
        Pill: {
            styles: { root: { border: vars.borderShort.strong } },
        },
        Autocomplete: {
            defaultProps: {
                size: "md",
                comboboxProps: { withinPortal: true, zIndex: 1100, keepMounted: false },
            },
        },
        TagsInput: {
            defaultProps: {
                size: "md",
                comboboxProps: { withinPortal: true, zIndex: 1100, keepMounted: false },
            },
        },
        Combobox: {
            defaultProps: {
                withinPortal: true,
                zIndex: 1100,
                keepMounted: false,
            },
        },
    },
})
