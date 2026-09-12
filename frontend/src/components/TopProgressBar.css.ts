import { createVar, style } from "@vanilla-extract/css"

import { vars } from "../theme/tokens"

/** Aktuální šířka pruhu (`0–100%`) — dynamická hodnota, řídí ji TopProgressBar.tsx. */
export const progressVar = createVar()

/** `position: fixed` — mimo tok dokumentu, takže objevení/zmizení nikdy neposune obsah pod ním. */
export const track = style({
    position: "fixed",
    // nad vším včetně Notifications (1400), viz komentář u <Notifications> v index.tsx
    zIndex: 1500,
    top: 0,
    right: 0,
    left: 0,
    pointerEvents: "none",
    height: 3,
    overflow: "hidden",
})

export const bar = style({
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    transition: "width 200ms ease-out, opacity 300ms ease-out 200ms",
    opacity: 1,
    background: vars.colors.primary,
    // sirka doplni na 100 % (viz TopProgressBar.tsx), az pak (delay) zacne mizet
    width: progressVar,
    "@media": {
        // stejný přístup jako .fa-spin v index.css.ts: hladké dobíhání vypnout, hodnoty
        // (šířka, viditelnost) se ale pořád mění stejně, jen bez plynulého přechodu
        "(prefers-reduced-motion: reduce)": {
            transition: "none",
        },
    },
})

/** Fáze po dokončení fetche — šířka je 100 %, teď se čeká na fadeout. */
export const barDone = style({
    opacity: 0,
})
