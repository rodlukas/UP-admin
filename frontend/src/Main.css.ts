import { globalStyle, style } from "@vanilla-extract/css"

/**
 * Výška fixního navbaru v px — jediný zdroj pravdy pro odvozené layout hodnoty:
 * `navbarInner.minHeight` a `isAuthenticated.paddingTop` (navbar + odstup obsahu).
 * Odvozené hodnoty se zapisují v rem (56px = 3.5rem při výchozích 16px = 1rem),
 * aby škálovaly s uživatelskou velikostí písma.
 */
export const NAVBAR_HEIGHT = 56

export const navbar = style({
    position: "fixed",
    zIndex: 1030,
    top: 0,
    right: 0,
    left: 0,
    borderBottom: "1px solid rgb(255 255 255 / 0.12)",
    boxShadow: "0 8px 18px rgb(15 23 42 / 0.22)",
    background: "linear-gradient(180deg, #1f2b3c 0%, #223247 100%)",
    padding: "0 0.8rem",
})

export const navbarInner = style({
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "0.5rem",
    margin: "0 auto",
    width: "100%",
    maxWidth: "1500px",
    minHeight: NAVBAR_HEIGHT,
})

export const navbarBrand = style({
    display: "flex",
    alignItems: "center",
    marginRight: "0.5rem",
    textDecoration: "none",
    letterSpacing: "0.01em",
    color: "#f8fafc",
    fontSize: "1.25rem",
    fontWeight: 600,
    ":hover": {
        textDecoration: "none",
        color: "#ffffff",
    },
})

export const navbarBadge = style({
    "@media": {
        "(min-width: 992px)": {
            marginRight: "0.5rem",
        },
    },
})

export const navbarBurger = style({
    marginLeft: "auto",
    // burger se skrývá od stejného px breakpointu jako se rozbaluje navbarCollapse —
    // záměrně px query místo Mantine hiddenFrom (em-based, viz komentář v Main.tsx)
    "@media": {
        "(min-width: 992px)": {
            display: "none",
        },
    },
})

export const navbarCollapse = style({
    display: "none",
    width: "100%",
    "@media": {
        "(min-width: 992px)": {
            display: "flex",
            flexBasis: "auto",
            flexGrow: 1,
            alignItems: "center",
            width: "auto",
        },
    },
})

export const navbarCollapseOpen = style({
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "0.2rem",
    paddingBottom: "0.5rem",
    width: "100%",
    // otevřené mobilní menu + zvětšení okna ≥992px (rotace tabletu): burger už je skrytý
    // a isMenuOpened nemá jak se resetovat — desktop hodnoty proto musí mobilní layout
    // přebít i v otevřeném stavu, jinak zůstane navbar rozbitý do další navigace
    "@media": {
        "(min-width: 992px)": {
            flexDirection: "row",
            alignItems: "center",
            gap: 0,
            paddingBottom: 0,
            width: "auto",
        },
    },
})

export const isAuthenticated = style({
    // výška navbaru (3.5rem) + 0.25rem odstup obsahu pod fixním navbarem
    marginBottom: "1.5rem",
    // odstup pod obsahem stránky; nepřihlášené stránky (přihlášení, 404) ho nemají,
    // aby se jejich obsah dal vycentrovat přes celou výšku viewportu
    paddingTop: `${NAVBAR_HEIGHT / 16 + 0.25}rem`,
})

// Mantine žádný `[data-mantine-modal]` atribut nevykresluje — obsah modalu je
// v `.mantine-Modal-content` (stejný selektor používá i FormBase.css.ts).
globalStyle(".main a, .mantine-Modal-content a", {
    textDecoration: "none",
})

globalStyle(".main a:hover, .mantine-Modal-content a:hover", {
    textDecoration: "underline",
})
