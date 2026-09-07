import { style } from "@vanilla-extract/css"

export const modalLecturesWizard = style({
    display: "inline",
})

export const dropdownToggle = style({
    verticalAlign: "top",
})

/** Text vedle „+" — používá se jen tam, kde tlačítko stojí samo (prázdný stav). */
export const dropdownToggleLabel = style({
    marginLeft: "0.45rem",
})
