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
    borderRadius: vars.radius.pill,
    selectors: {
        // plny outline misto poloprusvitneho focusRing stinu - ring s alpha 0.16 je
        // jako jediny indikator nedostatecny (~1.2:1 vuci pozadi stranky, WCAG 2.4.7);
        // outline navic prezije i forced-colors rezim
        "&:focus-visible": {
            outline: `2px solid ${vars.colors.primary}`,
            outlineOffset: "2px",
        },
    },
})

export const arrowBtn = style({
    transition: "all 0.15s ease-in-out",
    marginTop: "0.15rem",
    borderRadius: vars.radius.pill,
    boxShadow: vars.shadow.control,
    backgroundColor: vars.bg.control,
    cursor: "pointer",
    padding: "0.2rem",
    color: vars.text.primary,
    fontSize: "2rem",
    selectors: {
        "&:hover": {
            backgroundColor: vars.bg.controlHover,
            color: vars.text.heading,
        },
    },
    // posun při hoveru jen pokud uživatel nemá omezený pohyb (prefers-reduced-motion)
    "@media": {
        "(prefers-reduced-motion: no-preference)": {
            selectors: {
                "&:hover": {
                    transform: "translateY(-1px)",
                },
            },
        },
    },
})

export const titleDate = style({
    display: "inline-block",
    borderRadius: vars.radius.sm, // aby mely dny v tydennim prehledu vzdy stejnou sirku
    backgroundColor: vars.bg.muted,
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
