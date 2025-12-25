import { globalStyle, style } from "@vanilla-extract/css"

// mnoho z nasledujicich stylu koresponduje se styly bootstrap inputu

export const colorPickerInput = style({
    background: "white",
    border: "1px solid #ced4da",
    borderRadius: "0 0.25rem 0.25rem 0",
    cursor: "pointer",
    display: "inline-block",
    height: "calc(1.5em + 0.75rem + 2px)",
    padding: "0.375rem",
    selectors: {
        "&:focus": {
            backgroundColor: "#fff",
            borderColor: "#80bdff",
            boxShadow: "0 0 0 0.2rem rgb(0 123 255 / 0.25)",
            color: "#495057",
            outline: 0,
        },
    },
})

globalStyle(`${colorPickerInput} > div`, {
    borderRadius: "0.25rem",
    height: "100%",
    width: "3rem",
})

export const colorPickerWindow = style({
    left: "-1rem",
    // rozsireni okraju, kam se da najet mysi bez zavreni okna
    padding: "1rem",
    position: "absolute",
    top: "-1rem",
    zIndex: 2,
})

// chrome-picker obsahuje hardcoded font-family s nedostupnym fontem
globalStyle(".chrome-picker", {
    fontFamily: "unset",
})
