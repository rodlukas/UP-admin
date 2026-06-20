import { globalStyle } from "@vanilla-extract/css"

import { vars } from "./theme/tokens"

globalStyle("html, body, .main, .root", {
    backgroundColor: vars.bg.page,
})

/**
 * Mantine v9 default `dark-2` (#828282) má kontrast 4.04:1 na `dark-7` pozadí (#242424) —
 * těsně pod WCAG AA hranicí pro normální text. Přemapováváme `dimmed` a `placeholder` na světlejší
 * odstíny, aby byl kontrast lepší v dark mode.
 */
globalStyle(":root[data-mantine-color-scheme='dark']", {
    vars: {
        "--mantine-color-dimmed": "var(--mantine-color-dark-1)",
        "--mantine-color-placeholder": "var(--mantine-color-dark-2)",
    },
})

/**
 * Zrcadlení dark remapu výše pro light mode: default `dimmed` je gray-6 (#868e96) s kontrastem
 * jen 3.32:1 na bílém povrchu — pod WCAG AA. Remap na gray-7 (#495057) dává 8.18:1 na bílé
 * a 7.01:1 na pozadí stránky (#e9eef5). `placeholder` (gray-5, 2.07:1) posouváme o odstín
 * na gray-6 (3.32:1), stejně jako dark remap posouvá placeholder o jeden odstín.
 * Placeholder smí zůstat pod 4.5:1 — WCAG 1.4.3 cílí na běžný text, placeholder je vodítko
 * a musí zůstat vizuálně odlišený od vyplněné hodnoty.
 */
globalStyle(":root[data-mantine-color-scheme='light']", {
    vars: {
        "--mantine-color-dimmed": "var(--mantine-color-gray-7)",
        "--mantine-color-placeholder": "var(--mantine-color-gray-6)",
    },
})

globalStyle("body", {
    // Zastávky #e9eef5 = light hodnota `vars.bg.page`; uvnitř gradientu token použít nejde
    // (obsahuje celý light-dark() výraz), gradient má navíc vlastní jemně odlišné krajní odstíny.
    backgroundImage:
        "light-dark(radial-gradient(circle at 0% 0%, #f6f9ff 0%, #e9eef5 45%, #e6edf5 100%), none)",
    lineHeight: 1.5,
    color: vars.text.primary,
})

// fontWeight tlačítek definuje theme (Button.styles.root v theme.ts), tady jen přechod
globalStyle(".mantine-Button-root", {
    transition: "all 0.15s ease-in-out",
})

globalStyle(".mantine-Button-root[type='submit'][data-variant='filled']", {
    boxShadow: "0 6px 14px rgb(79 70 229 / 0.28)",
})

// hover lift jen pokud uzivatel nema omezeny pohyb (prefers-reduced-motion)
globalStyle(".mantine-Button-root[type='submit'][data-variant='filled']:hover", {
    "@media": {
        "(prefers-reduced-motion: no-preference)": {
            transform: "translateY(-1px)",
        },
    },
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
globalStyle(".gdpr .mantine-Spotlight-actionLabel, .gdpr .mantine-Spotlight-actionDescription", {
    backgroundColor: "currentcolor !important",
    userSelect: "none",
})

// `highlightQuery` v Spotlightu obaluje shodne podretezce do <mark>, ktery ma vlastni zluty
// background a tim by prosvitl skrz GDPR masku. Mark zneviditelnime - dedi pozadi parentu
// (currentcolor maska) a vlastni text barvu nuluje, aby pri sdileni obrazovky neunikla
// cast PII obsazena v hledanem dotazu.
globalStyle(
    ".gdpr .mantine-Spotlight-actionLabel mark, .gdpr .mantine-Spotlight-actionDescription mark",
    {
        backgroundColor: "inherit !important",
        color: "transparent !important",
    },
)

// Vstupní pole vyhledávání Spotlightu – uživatel do něj píše jména/telefony klientů,
// takže by v GDPR módu samotný dotaz prosvítil PII (výsledky pod ním už maskované jsou).
// Stejný princip jako `gdprInput` u Select polí: text i kurzor zprůhledníme.
globalStyle(".gdpr .mantine-Spotlight-search", {
    caretColor: "transparent",
    color: "transparent !important",
})
