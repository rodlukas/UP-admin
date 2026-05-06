import { globalStyle, style } from "@vanilla-extract/css"

import { vars } from "../../theme/tokens"

// mnoho z nasledujicich stylu koresponduje se styly Bootstrap 5

export const colorPickerContainer = style({
    width: "100%",
})

export const requiredMark = style({
    color: "var(--mantine-color-red-7)",
})

globalStyle(".rcp-root", {
    border: vars.borderShort.default,
    borderRadius: "0.5rem",
    boxShadow: "0 8px 20px rgb(15 23 42 / 0.05)",
    // @ts-expect-error - vanilla-extract nepodporuje CSS promenne naprimo, ale funguje to
    "--rcp-background-color": "light-dark(#f8fafc, var(--mantine-color-dark-6))",
    "--rcp-field-input-color": "light-dark(black, var(--mantine-color-gray-1))",
})

globalStyle(".rcp-saturation", {
    borderRadius: "0.5rem 0.5rem 0 0",
})

globalStyle(".rcp-field-input", {
    transition: "border-color 120ms ease, box-shadow 120ms ease",
    border: vars.borderShort.default,
    borderRadius: "0.5rem",
    backgroundColor: "light-dark(white, var(--mantine-color-dark-6))",
    minHeight: "2.6rem",
    color: "light-dark(black, var(--mantine-color-gray-1))",
})

globalStyle(".rcp-field-input:focus", {
    borderColor: "light-dark(#8ea0b5, var(--mantine-color-indigo-5))",
    boxShadow: "0 0 0 0.18rem rgba(142, 160, 181, 0.2)",
})
