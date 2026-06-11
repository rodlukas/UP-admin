import { globalStyle, style } from "@vanilla-extract/css"

import { statusNoticeInfo, statusNoticeWarning } from "../global/surfaces.css"
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
    border: vars.borderShort.formDivider,
    borderRadius: vars.radius.lg,
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
    color: vars.text.headingSoft,
    fontSize: "0.92rem",
    fontWeight: 600,
})

export const attendeeBlock = style({
    borderRadius: vars.radius.md,
    backgroundColor: vars.bg.subtleElevated,
    padding: "0.85rem 0.9rem",
    selectors: {
        "& + &": {
            marginTop: "0.75rem",
        },
    },
})

export const infoNotice = style([
    statusNoticeInfo,
    {
        padding: "0.75rem 0.9rem",
        color: vars.text.slate,
    },
])

export const warningNotice = style([
    statusNoticeWarning,
    {
        padding: "0.75rem 0.9rem",
        color: vars.text.slate,
    },
])

export const paidLabelPaid = style({
    color: vars.colors.success,
    fontWeight: 700,
})

export const paidLabelUnpaid = style({
    color: vars.colors.danger,
    fontWeight: 700,
})
