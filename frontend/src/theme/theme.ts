import { createTheme } from "@mantine/core"

const FONT_FAMILY =
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif'

export const theme = createTheme({
    primaryColor: "indigo",
    defaultRadius: "md",
    fontFamily: FONT_FAMILY,
    headings: {
        fontFamily: FONT_FAMILY,
        sizes: {
            h1: { fontSize: "1.75rem", fontWeight: "600" },
            h2: { fontSize: "1.35rem", fontWeight: "600" },
            h3: { fontSize: "1.5rem", fontWeight: "600" },
        },
    },
    focusRing: "auto",
    components: {
        Modal: {
            defaultProps: {
                centered: true,
                zIndex: 1050,
                overlayProps: { backgroundOpacity: 0.55, blur: 3 },
                transitionProps: { transition: "fade", duration: 200 },
            },
        },
        Button: {
            defaultProps: {},
            styles: {
                root: { fontWeight: 500 },
            },
        },
        Tooltip: {
            defaultProps: {
                withinPortal: true,
                zIndex: 1300,
            },
        },
        Table: {
            defaultProps: {
                highlightOnHover: true,
                withTableBorder: true,
                verticalSpacing: "xs",
            },
        },
        TableTh: {
            defaultProps: {
                scope: "col",
            },
        },
        Title: {
            styles: {
                root: { letterSpacing: "0.01em" },
            },
        },
    },
})
