import { globalStyle, style } from "@vanilla-extract/css"

import { vars } from "../theme/tokens"

export const prepaidLectureCnt = style({
    display: "inline-block",
    marginLeft: "0.55rem",
    width: "5rem",
})

export const formGroup = style({})

globalStyle(`${formGroup} > div:not(:last-child)`, {
    "@media": {
        "(max-width: 575.98px)": {
            marginBottom: "1rem",
        },
    },
})

export const attendancePaidCol = style({
    textAlign: "center",
    "@media": {
        "(max-width: 575.98px)": {
            textAlign: "left",
        },
    },
})

export const sectionCard = style({
    border: "1px solid light-dark(#e9eef5, var(--mantine-color-dark-4))",
    borderRadius: "0.9rem",
    backgroundColor: vars.bg.elevated,
    padding: "0.95rem 1rem",
    selectors: {
        "& + &": {
            marginTop: "1rem",
        },
    },
})

export const sectionTitle = style({
    marginBottom: "0.8rem",
    textTransform: "none",
    letterSpacing: "0.01em",
    color: "light-dark(#0f172a, var(--mantine-color-gray-1))",
    fontSize: "0.92rem",
    fontWeight: 600,
})

export const attendeeBlock = style({
    borderRadius: "0.75rem",
    backgroundColor: "light-dark(#f8fafc, var(--mantine-color-dark-5))",
    padding: "0.85rem 0.9rem",
    selectors: {
        "& + &": {
            marginTop: "0.75rem",
        },
    },
})

export const infoNotice = style({
    border: "1px solid light-dark(#dbeafe, var(--mantine-color-blue-9))",
    borderLeft: "3px solid light-dark(#60a5fa, var(--mantine-color-blue-6))",
    borderRadius: "0.8rem",
    backgroundColor: "light-dark(#f8fbff, var(--mantine-color-dark-5))",
    padding: "0.75rem 0.9rem",
    color: "light-dark(#334155, var(--mantine-color-gray-2))",
})

export const warningNotice = style({
    border: "1px solid light-dark(#fde7c7, var(--mantine-color-orange-9))",
    borderLeft: "3px solid #f59e0b",
    borderRadius: "0.8rem",
    backgroundColor: "light-dark(#fffaf0, var(--mantine-color-dark-5))",
    padding: "0.75rem 0.9rem",
    color: "light-dark(#334155, var(--mantine-color-gray-2))",
})

export const paidLabelPaid = style({
    color: "var(--mantine-color-green-7)",
    fontWeight: 700,
})

export const paidLabelUnpaid = style({
    color: "var(--mantine-color-red-7)",
    fontWeight: 700,
})
