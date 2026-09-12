import { style } from "@vanilla-extract/css"

import { numericCell } from "../global/utility.css"

// Styly sdílené se stránkou Skupiny (záměrně paralelní UI) žijí v ClientsGroups.css.ts
export {
    hiddenBelowSm,
    pagination,
    staleAlert,
    tableSection,
    titleCount,
} from "./ClientsGroups.css"

export const emailHeader = style({
    wordBreak: "keep-all",
})

export const nameCell = style({
    width: "13em",
    minWidth: "13em",
    fontWeight: 600,
})

// tabulkové číslice jako `numericCell` jinde — telefon je taky sloupec čísel, sjednotí se pod sebou
export const phoneCell = style([
    numericCell,
    {
        minWidth: "7em",
    },
])

export const hiddenBelowMd = style({
    "@media": {
        "(max-width: 767.98px)": {
            display: "none",
        },
    },
})
