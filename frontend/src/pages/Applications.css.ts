import { createThemeContract, style } from "@vanilla-extract/css"

import { vars } from "../theme/tokens"

export const applicationsVars = createThemeContract({
    courseBackground: "",
    badgeColor: "",
})

export const course = style({
    display: "flex",
    flexDirection: "column",
    border: vars.borderShort.default,
    borderRadius: "0.6rem",
    boxShadow: vars.shadow.card,
    backgroundColor: vars.bg.surface,
    overflow: "hidden",
    selectors: {
        "& + &": {
            marginTop: "1.1rem",
        },
    },
})

export const applicationItem = style({
    transition: "background-color 0.12s ease-in-out",
    borderTop: vars.borderShort.default,
    backgroundColor: vars.bg.surface,
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
    borderBottom: vars.borderShort.default,
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
    color: vars.text.primary,
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
