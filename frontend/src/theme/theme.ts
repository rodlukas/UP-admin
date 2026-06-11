import { createTheme } from "@mantine/core"

const FONT_FAMILY =
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif'

/**
 * Výchozí přechod modálních oken. Sdílí ho theme default níže a BaseModal —
 * `transitionProps` předané Modalu totiž theme default nahrazují celé (ne po klíčích),
 * takže např. samotné `{ onExited }` by modal tiše přepnulo na Mantine default "fade-down".
 */
export const MODAL_TRANSITION_PROPS = { transition: "fade", duration: 200 } as const

export const theme = createTheme({
    primaryColor: "indigo",
    defaultRadius: "md",
    // Mantine přechody (modaly, tooltipy, …) respektují prefers-reduced-motion;
    // vlastní transformace v *.css.ts musí mít media query zvlášť.
    respectReducedMotion: true,
    fontFamily: FONT_FAMILY,
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
        Button: {
            styles: {
                root: { fontWeight: 500 },
            },
        },
        Tooltip: {
            defaultProps: {
                withinPortal: true,
                zIndex: 1300,
            },
        },
        Table: {
            defaultProps: {
                highlightOnHover: true,
                withTableBorder: true,
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
                root: { letterSpacing: "0.01em" },
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
                comboboxProps: { withinPortal: true, zIndex: 1100, keepMounted: false },
            },
        },
        MultiSelect: {
            defaultProps: {
                comboboxProps: { withinPortal: true, zIndex: 1100, keepMounted: false },
            },
        },
        Autocomplete: {
            defaultProps: {
                comboboxProps: { withinPortal: true, zIndex: 1100, keepMounted: false },
            },
        },
        TagsInput: {
            defaultProps: {
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
