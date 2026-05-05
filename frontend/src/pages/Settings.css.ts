import { globalStyle, style } from "@vanilla-extract/css"

export const footer = style({})

globalStyle(`${footer} a`, {
    textDecoration: "underline",
    color: "inherit",
})

globalStyle(`${footer} a:hover`, {
    color: "var(--mantine-color-indigo-6)",
})

export const settingsColumn = style({
    border: "1px solid light-dark(#d6dee9, var(--mantine-color-dark-4))",
    borderRadius: "0.6rem",
    boxShadow: "0 14px 30px rgb(15 23 42 / 0.08), 0 4px 12px rgb(15 23 42 / 0.06)",
    backgroundColor: "light-dark(#ffffff, var(--mantine-color-dark-7))",
    padding: "1rem 1rem 1.1rem",
    height: "100%",
})

globalStyle(`${settingsColumn} h2`, {
    marginBottom: "0.75rem",
})

globalStyle(`${settingsColumn} h3`, {
    marginTop: "0.9rem",
    marginBottom: "0.65rem",
    fontSize: "1.15rem",
})

globalStyle(`${settingsColumn} hr`, {
    opacity: 1,
    marginTop: "0.9rem",
    marginBottom: "0.9rem",
    borderColor: "light-dark(#d6dee9, var(--mantine-color-dark-4))",
})

export const settingsColumnsRow = style({
    marginBottom: "1rem",
})

export const tableSection = style({
    marginTop: "0.25rem",
})

export const configList = style({
    marginTop: "0.8rem",
    marginBottom: "0.75rem",
})

export const configListItem = style({
    padding: "0.55rem 0",
    selectors: {
        "& + &": {
            borderTop: "1px solid var(--mantine-color-gray-2)",
        },
    },
})

export const configRow = style({
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
})

export const configRowLabel = style({
    flex: "0 0 58%",
})

export const configRowControl = style({
    flex: 1,
})

export const emptyMessage = style({
    textAlign: "center",
})

export const appearanceSection = style({
    marginTop: "1.1rem",
    marginBottom: "1.1rem",
    border: "1px solid light-dark(#d6dee9, var(--mantine-color-dark-4))",
    borderRadius: "0.6rem",
    boxShadow: "0 14px 30px rgb(15 23 42 / 0.08), 0 4px 12px rgb(15 23 42 / 0.06)",
    backgroundColor: "light-dark(#ffffff, var(--mantine-color-dark-7))",
    padding: "1rem 1rem 1.1rem",
})

globalStyle(`${appearanceSection} h2`, {
    marginBottom: "0.75rem",
})

export const footerBlock = style({
    marginTop: "1.1rem",
    border: "1px solid light-dark(#d6dee9, var(--mantine-color-dark-4))",
    borderRadius: "0.6rem",
    boxShadow: "0 12px 26px rgb(15 23 42 / 0.07), 0 3px 10px rgb(15 23 42 / 0.05)",
    backgroundColor: "light-dark(#ffffff, var(--mantine-color-dark-7))",
    padding: "0.9rem 1rem",
})
