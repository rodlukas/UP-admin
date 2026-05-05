import { style } from "@vanilla-extract/css"

export const bankWrapper = style({
    border: "1px solid light-dark(#d6dee9, var(--mantine-color-dark-4))",
    borderRadius: "0.55rem",
    boxShadow: "0 14px 30px rgb(15 23 42 / 0.08), 0 4px 12px rgb(15 23 42 / 0.06)",
    backgroundColor: "light-dark(#ffffff, var(--mantine-color-dark-7))",
    overflow: "hidden",
})

export const bankTitle = style({
    borderBottom: "1px solid light-dark(#d6dee9, var(--mantine-color-dark-4))",
    padding: "0.8rem",
})

export const bankTitleInner = style({
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "0.5rem",
})

export const bankContent = style({
    padding: "0.8rem",
})

export const bankTitleText = style({
    marginBottom: 0,
    "@media": {
        "(min-width: 576px)": {
            paddingLeft: "2.3125rem",
        },
    },
})

export const bankActions = style({
    color: "var(--mantine-color-gray-6)",
})

export const bankDateColumn = style({
    minWidth: "6em",
})

export const bankAmountColumn = style({
    minWidth: "7em",
})

export const bankTitleOk = style({
    backgroundColor: "light-dark(var(--mantine-color-green-1), var(--mantine-color-green-9))",
})

export const bankTitleWarning = style({
    backgroundColor: "light-dark(var(--mantine-color-red-1), var(--mantine-color-red-9))",
})

export const bankRowToday = style({
    backgroundColor: "light-dark(var(--mantine-color-yellow-1), var(--mantine-color-yellow-9))",
})
