import { style } from "@vanilla-extract/css"

// Styly sdílené se stránkou Skupiny (záměrně paralelní UI) žijí v ClientsGroups.css.ts
export { hiddenBelowSm, staleAlert, tableSection } from "./ClientsGroups.css"

export const emailHeader = style({
    wordBreak: "keep-all",
})

export const nameCell = style({
    width: "13em",
    minWidth: "13em",
    fontWeight: 600,
})

export const phoneCell = style({
    minWidth: "7em",
})

export const hiddenBelowMd = style({
    "@media": {
        "(max-width: 767px)": {
            display: "none",
        },
    },
})
