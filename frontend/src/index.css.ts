import { globalStyle } from "@vanilla-extract/css"

import { vars } from "./theme/tokens"

globalStyle("html, body, .main, .root", {
    backgroundColor: "light-dark(#e9eef5, var(--mantine-color-dark-9))",
})

/**
 * Mantine v9 default `dark-2` (#828282) má kontrast ~4.3:1 na `dark-7` pozadí (#242424) —
 * těsně pod WCAG AA hranicí pro normální text. Přemapováváme `dimmed` a `placeholder` na světlejší
 * odstíny, aby byl kontrast lepší v dark mode.
 */
globalStyle(":root[data-mantine-color-scheme='dark']", {
    vars: {
        "--mantine-color-dimmed": "var(--mantine-color-dark-1)",
        "--mantine-color-placeholder": "var(--mantine-color-dark-2)",
    },
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
    borderColor: vars.colors.primary,
    boxShadow: vars.shadow.focusRing,
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

/**************************** DJANGO-DEBUG-TOOLBAR ****************************/

globalStyle("#djDebugToolbarHandle", {
    top: "380px !important",
})

/**************************** GDPR ****************************/

globalStyle(".gdpr [data-gdpr]", {
    backgroundColor: "currentcolor !important",
    userSelect: "none",
})

// Mantine Spotlight nepodporuje ReactNode pro label/description, takže data-gdpr nelze použít.
// V GDPR módu skryjeme jména/telefony/emaily klientů přes stabilní statické třídy Mantine.
globalStyle(
    ".gdpr .mantine-Spotlight-actionLabel, .gdpr .mantine-Spotlight-actionDescription",
    {
        backgroundColor: "currentcolor !important",
        userSelect: "none",
    },
)
