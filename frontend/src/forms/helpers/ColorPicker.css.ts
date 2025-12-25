import { globalStyle, style } from "@vanilla-extract/css"

// mnoho z nasledujicich stylu koresponduje se styly bootstrap inputu

export const colorPickerInput = style({
    display: "inline-block",
    border: "1px solid #ced4da",
    borderRadius: "0 0.25rem 0.25rem 0",
    background: "white",
    cursor: "pointer",
    padding: "0.375rem",
    height: "calc(1.5em + 0.75rem + 2px)",
    selectors: {
        "&:focus": {
            outline: 0,
            borderColor: "#80bdff",
            boxShadow: "0 0 0 0.2rem rgb(0 123 255 / 0.25)",
            backgroundColor: "#fff",
            color: "#495057",
        },
    },
})

globalStyle(`${colorPickerInput} > div`, {
    borderRadius: "0.25rem",
    width: "3rem",
    height: "100%",
})

export const colorPickerWindow = style({
    position: "absolute",
    zIndex: 2,
    // rozsireni okraju, kam se da najet mysi bez zavreni okna
    top: "-1rem",
    left: "-1rem",
    padding: "1rem",
})

// chrome-picker obsahuje hardcoded font-family s nedostupnym fontem
globalStyle(".chrome-picker", {
    fontFamily: "unset",
})
