import { style } from "@vanilla-extract/css"

import { vars } from "../theme/tokens"

export const diaryDay = style({
    "@media": {
        "(min-width: 768px) and (max-width: 991.98px)": {
            selectors: {
                "&:nth-of-type(n + 3)": {
                    paddingTop: "15px",
                },
            },
        },
        "(min-width: 992px)": {
            paddingBottom: "15px",
        },
        "(max-width: 767.98px)": {
            selectors: {
                "& + &": {
                    paddingTop: "15px",
                },
            },
        },
    },
})

export const disabledLink = style({
    cursor: "default",
})

export const arrowLink = style({
    display: "inline-flex",
    outline: "none",
    borderRadius: vars.radius.pill,
    selectors: {
        "&:focus-visible": {
            boxShadow: "0 0 0 0.23rem rgb(13 110 253 / 0.35)",
        },
    },
})

export const arrowBtn = style({
    transition: "all 0.15s ease-in-out",
    marginTop: "0.15rem",
    borderRadius: vars.radius.pill,
    boxShadow: "0 4px 10px rgb(15 23 42 / 0.1)",
    backgroundColor: "light-dark(#e2e8f0, var(--mantine-color-dark-5))",
    cursor: "pointer",
    padding: "0.2rem",
    color: vars.text.primary,
    fontSize: "2rem",
    selectors: {
        "&:hover": {
            transform: "translateY(-1px)",
            backgroundColor: "light-dark(#cfd8e3, var(--mantine-color-dark-4))",
            color: "light-dark(#0f172a, var(--mantine-color-gray-0))",
        },
    },
})

export const titleDate = style({
    display: "inline-block",
    borderRadius: vars.radius.sm, // aby mely dny v tydennim prehledu vzdy stejnou sirku
    backgroundColor: "rgb(148 163 184 / 0.12)",
    padding: "0.05rem 0.2rem",
    width: "6ch",
    textAlign: "center",
    color: vars.text.primary,
    fontWeight: 700,
})

export const titleDateLong = style({
    width: "10ch",
})

export const weekGrid = style({
    marginTop: "0.5rem",
    paddingRight: "0.75rem",
    paddingLeft: "0.75rem",
    "@media": {
        "(max-width: 767.98px)": {
            paddingRight: "0.5rem",
            paddingLeft: "0.5rem",
        },
    },
})

export const weekRow = style({
    display: "flex",
    flexWrap: "wrap",
    marginRight: "-0.75rem",
    marginLeft: "-0.75rem",
    "@media": {
        "(max-width: 767.98px)": {
            marginRight: "-0.5rem",
            marginLeft: "-0.5rem",
        },
    },
})

export const weekDayCol = style({
    paddingRight: "0.75rem",
    paddingLeft: "0.75rem",
    width: "100%",
    "@media": {
        "(min-width: 768px) and (max-width: 991.98px)": {
            flex: "0 0 50%",
            maxWidth: "50%",
        },
        "(min-width: 992px)": {
            flex: "1",
        },
        "(max-width: 767.98px)": {
            paddingRight: "0.5rem",
            paddingLeft: "0.5rem",
        },
    },
})
