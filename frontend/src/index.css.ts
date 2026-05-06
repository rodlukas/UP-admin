import { globalStyle } from "@vanilla-extract/css"

import { vars } from "./theme/tokens"

globalStyle("html, body, .main, .root", {
    backgroundColor: "light-dark(#e9eef5, var(--mantine-color-dark-9))",
})

globalStyle("body", {
    backgroundImage:
        "light-dark(radial-gradient(circle at 0% 0%, #f6f9ff 0%, #e9eef5 45%, #e6edf5 100%), none)",
    lineHeight: 1.5,
    color: vars.text.primary,
})

globalStyle(".mantine-Button-root", {
    transition: "all 0.15s ease-in-out",
    fontWeight: 500,
})

globalStyle(".mantine-Button-root[type='submit'][data-variant='filled']", {
    boxShadow: "0 6px 14px rgb(79 70 229 / 0.28)",
})

globalStyle(".mantine-Button-root[type='submit'][data-variant='filled']:hover", {
    transform: "translateY(-1px)",
})

globalStyle(".mantine-Input-input:focus, .mantine-Textarea-input:focus", {
    borderColor: "var(--mantine-color-indigo-5)",
    boxShadow: "0 0 0 .2rem rgba(99, 102, 241, 0.2)",
})

globalStyle(".mantine-Input-input, .mantine-Textarea-input", {
    borderColor: vars.border.default,
})

// omezeni max sirky kontejneru
globalStyle(".mantine-Container-root, .container", {
    maxWidth: "1500px",
})

globalStyle("b", {
    fontWeight: 600,
})

globalStyle("h1, h2, h3", {
    marginBottom: "0.65rem",
})

globalStyle("label", {
    userSelect: "none",
})

/**************************** REACT-TOASTIFY ****************************/

globalStyle(".Toastify__toast--warning", {
    background: "#e7b90f !important",
})

globalStyle(".Toastify__toast", {
    fontFamily: "unset !important",
})

// aby notifikace neprekryvala menu
globalStyle(".Toastify__toast-container--top-right", {
    top: "unset !important",
})

/**************************** DJANGO-DEBUG-TOOLBAR ****************************/

globalStyle("#djDebugToolbarHandle", {
    top: "380px !important",
})

/**************************** GDPR ****************************/

globalStyle(".gdpr [data-gdpr]", {
    backgroundColor: "currentcolor !important",
    userSelect: "none",
})
