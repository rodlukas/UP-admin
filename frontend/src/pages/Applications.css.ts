import { createThemeContract, style } from "@vanilla-extract/css"

export const applicationsVars = createThemeContract({
    courseBackground: "",
    badgeColor: "",
})

export const course = style({
    display: "flex",
    flexDirection: "column",
    border: "1px solid light-dark(#d6dee9, var(--mantine-color-dark-4))",
    borderRadius: "0.6rem",
    boxShadow: "0 14px 30px rgb(15 23 42 / 0.08), 0 4px 12px rgb(15 23 42 / 0.06)",
    backgroundColor: "light-dark(#ffffff, var(--mantine-color-dark-7))",
    overflow: "hidden",
    selectors: {
        "& + &": {
            marginTop: "1.1rem",
        },
    },
})

export const applicationItem = style({
    transition: "background-color 0.12s ease-in-out",
    borderTop: "1px solid light-dark(#dbe3ed, var(--mantine-color-dark-4))",
    backgroundColor: "light-dark(#ffffff, var(--mantine-color-dark-7))",
    padding: "0.5rem 1rem",
    selectors: {
        "&:hover": {
            backgroundColor: "light-dark(#f4f7fb, var(--mantine-color-dark-6))",
        },
    },
})

export const applicationRow = style({
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
})

export const courseHeadingItem = style({
    display: "flex",
    alignItems: "center",
    gap: "0.65rem",
    borderBottom: "1px solid light-dark(#dbe3ed, var(--mantine-color-dark-4))",
    borderLeft: `4px solid ${applicationsVars.courseBackground}`,
    backgroundColor: "light-dark(#f1f5f9, var(--mantine-color-dark-6))",
    padding: "0.6rem 1rem",
})

export const courseHeadingBadge = style({
    marginLeft: "0.1rem",
    backgroundColor: `${applicationsVars.courseBackground} !important`,
    color: "white !important",
    fontSize: "0.7rem",
    fontWeight: 700,
})

export const courseHeading = style({
    marginBottom: 0,
    color: "light-dark(#1f2937, var(--mantine-color-gray-1))",
    fontSize: "1rem",
    fontWeight: 600,
})

export const applicationMeta = style({
    marginTop: "0.25rem",
    width: "100%",
    color: "light-dark(#475569, var(--mantine-color-dark-2))",
    "@media": {
        "(min-width: 768px)": {
            flex: "0 0 41.666667%",
            marginTop: 0,
            width: "41.666667%",
        },
    },
})

export const createdBadge = style({
    marginRight: "0.35rem",
    fontWeight: 600,
})

export const applicationActions = style({
    display: "flex",
    justifyContent: "flex-end",
    gap: "0.35rem",
    "@media": {
        "(max-width: 767.98px)": {
            justifyContent: "flex-start",
            marginTop: "0.35rem",
        },
    },
})

export const listSection = style({
    marginTop: "0.25rem",
})

export const applicationNameCol = style({
    width: "100%",
    "@media": {
        "(min-width: 768px)": {
            flex: "0 0 25%",
            width: "25%",
        },
        "(max-width: 767.98px)": {
            marginBottom: "0.2rem",
        },
    },
})

export const applicationPhoneCol = style({
    width: "100%",
    "@media": {
        "(min-width: 768px)": {
            flex: "0 0 16.666667%",
            width: "16.666667%",
        },
        "(max-width: 767.98px)": {
            marginTop: "0.3rem",
        },
    },
})

export const applicationActionsCol = style({
    marginTop: "0.25rem",
    width: "100%",
    "@media": {
        "(min-width: 768px)": {
            flex: "0 0 16.666667%",
            marginTop: 0,
            width: "16.666667%",
        },
    },
})
