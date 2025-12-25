import { style } from "@vanilla-extract/css"

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

export const arrowBtn = style({
    cursor: "pointer",
    fontSize: "2rem",
    marginTop: "0.15rem",
    transition: "color 0.15s ease-in-out",
    selectors: {
        "&:hover": {
            color: "#5a6268",
        },
    },
})

export const titleDate = style({
    display: "inline-block",
    width: "6ch", // aby mely dny v tydennim prehledu vzdy stejnou sirku
})

export const titleDateLong = style({
    width: "10ch",
})
