import { createThemeContract, style } from "@vanilla-extract/css"

import { vars } from "../theme/tokens"

export const courseNameVars = createThemeContract({
    /** Barva kurzu (uživatelský hex z Nastavení). */
    color: "",
})

export const courseBandVars = createThemeContract({
    /** Barva kurzu (uživatelský hex z Nastavení). */
    color: "",
    /** Barva textu čitelná na `color` — dopočítává `contrastingTextColor`. */
    text: "",
})

/**
 * Sytý podklad v barvě kurzu — **jediný zdroj pravdy** pro místa, kde má být kurz poznat
 * na první pohled. Skládá ho hlavička kurzu na kartě klienta i u zájemců a chip v seznamu
 * skupin; tentýž zápis nese `lectureHeader` (DashboardDay.css.ts) v diáři a přehledu.
 *
 * Odstín se **neředí** (na rozdíl od `courseDot` níže): tlumit barvu má smysl u tiché tečky
 * v hustém seznamu, ne tam, kde je barva hlavní nosič příslušnosti. Čitelnost proto drží
 * barva textu, kterou podle kontrastu dopočítá `contrastingTextColor` — je stejná v obou
 * motivech, protože podklad je taky stejný.
 *
 * Vše uvnitř musí psát `currentColor`: vlastní tlumené barvy z palety na sytém podkladu
 * zmizí (stejný důvod jako u pruhu lekce v diáři).
 */
export const courseBand = style({
    background: courseBandVars.color,
    color: courseBandVars.text,
})

/** Chip pro místa, kde na plný pruh není místo — buňka tabulky v seznamu skupin. */
export const courseChip = style([
    courseBand,
    {
        display: "inline-block",
        borderRadius: vars.radius.pill,
        padding: "0.1rem 0.55rem",
        fontWeight: 600,
    },
])

export const courseName = style({
    color: vars.text.primary,
    fontWeight: 500,
})

/**
 * Tečka v barvě kurzu. `color-mix` proti inkoustu/světlé je tu proto, že barva kurzu je
 * uživatelský hex a bez srovnání světlosti zmizí na bílé nebo na tmavé ploše. Stejný
 * recept používá levá linka kurzu v Applications.css.ts.
 */
export const courseDot = style({
    display: "inline-block",
    marginRight: "0.4rem",
    borderRadius: vars.radius.pill,
    background: `light-dark(color-mix(in oklab, ${courseNameVars.color} 92%, #16233a), color-mix(in oklab, ${courseNameVars.color} 72%, #e7ecf4))`,
    width: "0.55rem",
    height: "0.55rem",
    verticalAlign: "baseline",
})
