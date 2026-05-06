import { globalStyle, style } from "@vanilla-extract/css"

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
    minHeight: "56px",
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
})

export const isAuthenticated = style({
    paddingTop: "3.75rem",
})

globalStyle(".main", {
    marginBottom: "1.5rem",
})

globalStyle(".nav-content", {
    maxWidth: "900px",
})

globalStyle(".main a, [data-mantine-modal] a", {
    textDecoration: "none",
})

globalStyle(".main a:hover, [data-mantine-modal] a:hover", {
    textDecoration: "underline",
})
