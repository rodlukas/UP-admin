import { style } from "@vanilla-extract/css"

import { surfaceFloating } from "../global/surfaces.css"
import { vars } from "../theme/tokens"

export const loginContainer = style({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem 1rem",
    // přihlašovací stránka běží bez navbaru (Main.tsx ho renderuje jen pro přihlášené),
    // karta se proto centruje přes celou výšku viewportu
    minHeight: "100dvh",
})

/**
 * Přihlašovací karta je jediný prvek na stránce a stránka nemá navigaci ani obsah kolem —
 * proto smí být skutečný plovoucí panel se stínem, i když je jinak v aplikaci obsah plochý.
 */
export const loginCard = style([
    surfaceFloating,
    {
        padding: "2.25rem",
        width: "100%",
        maxWidth: "420px",
    },
])

export const logoContainer = style({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "1.5rem",
})

export const logo = style({
    filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))",
    width: "90px",
    height: "90px",
})

export const title = style({
    marginBottom: "0.5rem",
    textAlign: "center",
    color: vars.text.primary,
    fontSize: "2.05rem",
    fontWeight: 700,
})

export const subtitle = style({
    marginBottom: "2rem",
    textAlign: "center",
    color: vars.text.muted,
    fontSize: "1rem",
    fontWeight: 400,
})

export const submitButton = style({
    width: "100%",
})

export const fieldWrapper = style({
    marginBottom: "1rem",
})
