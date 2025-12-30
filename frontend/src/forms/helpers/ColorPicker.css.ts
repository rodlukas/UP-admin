import { globalStyle, style } from "@vanilla-extract/css"

// mnoho z nasledujicich stylu koresponduje se styly Bootstrap 5

export const colorPickerContainer = style({
    width: "100%",
})

globalStyle(".rcp-root", {
    border: "1px solid #dee2e6",
    borderRadius: "0.375rem",
    // @ts-expect-error - vanilla-extract nepodporuje CSS proměnné přímo, ale funguje to
    "--rcp-background-color": "#f8f9fa",
    "--rcp-field-input-color": "black",
})

globalStyle(".rcp-saturation", {
    borderRadius: "0.375rem 0.375rem 0 0",
})

globalStyle(".rcp-field-input", {
    border: "1px solid #dee2e6",
    backgroundColor: "white",
    color: "black",
})

globalStyle(".rcp-field-input:focus", {
    borderColor: "#86b7fe",
    boxShadow: "0 0 0 0.25rem rgba(13, 110, 253, 0.25)",
})
