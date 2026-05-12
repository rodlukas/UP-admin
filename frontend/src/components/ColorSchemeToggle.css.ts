import { style } from "@vanilla-extract/css"

export const toggleButton = style({
    border: "none",
    color: "rgb(241 245 249 / 0.85)",
    // Mantine ActionIcon v "subtle" variantě ovládá barvu ikony přes --ai-color;
    // navbar má fixní tmavé pozadí ve všech motivech, takže ikonu držíme světlou.
    vars: {
        "--ai-color": "rgb(241 245 249 / 0.85)",
        "--ai-hover-color": "#ffffff",
        "--ai-hover": "rgb(255 255 255 / 0.12)",
    },
    "@media": {
        "(min-width: 992px)": {
            marginLeft: "0.25rem",
        },
        "(max-width: 991.98px)": {
            alignSelf: "flex-start",
            marginTop: "0.25rem",
        },
    },
    selectors: {
        "&:hover": {
            backgroundColor: "rgb(255 255 255 / 0.12)",
            color: "#ffffff",
        },
    },
})

export const dropdown = style({
    border: "none",
})
