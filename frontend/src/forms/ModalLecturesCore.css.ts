import { style } from "@vanilla-extract/css"

export const modalFormLecture = style({
    maxWidth: "1180px",
    "@media": {
        "(min-width: 576px) and (max-width: 991.98px)": {
            maxWidth: "960px",
        },
    },
})
