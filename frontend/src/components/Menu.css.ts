import { globalStyle, style } from "@vanilla-extract/css"

import { vars } from "../theme/tokens"

/**
 * Focus ring prvků ležících na tmavém navbaru. Výchozí indigo ring Mantine
 * (`.mantine-focus-auto`) i poloprůsvitný stín mají vůči navbaru (#1f2b3c) jen ~2,3–3:1,
 * tedy pod WCAG 1.4.11; blue-3 je výrazně viditelnější a plný outline přežije i
 * forced-colors režim.
 *
 * Na prvcích Mantine (nesou třídu `mantine-focus-auto`) musí selektor znít
 * `&.mantine-focus-auto:focus-visible` — se samotným `:focus-visible` je specificita
 * shodná a rozhodovalo by pořadí pravidel v bundlu. Prvky bez té třídy (`Link`)
 * použijí `:focus-visible` přímo.
 *
 * Bez TS anotací — vanilla-extract loader vkládá zdroj .css.ts do child kompilace
 * bez transpilace typů (viz global/surfaces.css.ts).
 */
export const navbarFocusRing = {
    outline: "2px solid var(--mantine-color-blue-3)",
    outlineOffset: "2px",
}

export const navLink = style({
    display: "block",
    transition: "all 0.15s ease-in-out",
    borderRadius: vars.radius.md,
    padding: "0.5rem 0.85rem",
    textDecoration: "none",
    color: "rgb(241 245 249 / 0.78)",
    fontWeight: 500,
    ":hover": {
        backgroundColor: "rgb(255 255 255 / 0.12)",
        textDecoration: "none",
        color: "#ffffff",
    },
    ":focus-visible": navbarFocusRing,
    "@media": {
        "(min-width: 992px)": {
            borderBottom: "2px solid transparent",
            borderRadius: 0,
            backgroundColor: "transparent",
            padding: "0.75rem 0.5rem 0.625rem",
            ":hover": {
                borderBottomColor: "rgb(255 255 255 / 0.6)",
                backgroundColor: "transparent",
                color: "#ffffff",
            },
        },
    },
})

// deklarováno až za `navLink` — při shodné specificitě rozhoduje pořadí v souboru
export const navLinkActive = style({
    backgroundColor: "rgb(255 255 255 / 0.18)",
    color: "#ffffff",
    fontWeight: 600,
    "@media": {
        "(min-width: 992px)": {
            borderBottomColor: "#ffffff",
            backgroundColor: "transparent",
        },
    },
})

export const navExternalLink = style({
    whiteSpace: "nowrap",
})

globalStyle(`${navExternalLink} svg`, {
    marginLeft: "0.2em",
})

export const navList = style({
    display: "flex",
    flexDirection: "column",
    margin: 0,
    padding: 0,
    width: "100%",
    listStyle: "none",
    "@media": {
        "(min-width: 992px)": {
            flexDirection: "row",
            gap: "0.25rem",
            marginLeft: "auto",
            width: "auto",
        },
    },
})

export const logoutButton = style({
    selectors: {
        "&.mantine-focus-auto:focus-visible": navbarFocusRing,
    },
    "@media": {
        "(min-width: 992px)": {
            marginLeft: "0.5rem",
        },
        "(max-width: 991.98px)": {
            marginTop: "0.5rem",
            width: "100%",
        },
    },
})

export const spotlightButton = style({
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    transition: "all 0.15s ease-in-out",
    borderRadius: vars.radius.md,
    padding: "0.4rem 0.75rem",
    color: "rgb(241 245 249 / 0.78)",
    fontSize: "0.875rem",
    ":hover": {
        backgroundColor: "rgb(255 255 255 / 0.12)",
        color: "#ffffff",
    },
    selectors: {
        "&.mantine-focus-auto:focus-visible": navbarFocusRing,
    },
    "@media": {
        "(min-width: 992px)": {
            marginRight: "0.75rem",
            border: "1px solid rgb(255 255 255 / 0.2)",
            width: "18rem",
            maxWidth: "30vw",
        },
        "(max-width: 991.98px)": {
            marginBottom: "0.25rem",
            padding: "0.5rem 0.85rem",
            width: "100%",
        },
    },
})

export const spotlightButtonLabel = style({
    flex: 1,
    overflow: "hidden",
    textAlign: "left",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
})
