import { globalStyle, style } from "@vanilla-extract/css"

export const prepaidLectureCnt = style({
    display: "inline-block",
    marginLeft: "0.7rem",
    width: "5rem",
})

globalStyle(".form-group > div:not(:last-child)", {
    "@media": {
        "(max-width: 575.98px)": {
            marginBottom: "1rem",
        },
    },
})
