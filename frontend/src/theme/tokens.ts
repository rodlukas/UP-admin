// Sémantické design tokeny aplikace.
// Používejte tyto hodnoty místo hardcoded hex/Mantine variables v .css.ts souborech.
// Single source of truth — pokud chceš změnit barvu povrchu, hraniční čáry, stínu nebo
// rohových rádiusů napříč aplikací, změň ji jen tady.

export const vars = {
    colors: {
        // Primární (značková indigo)
        primary: "var(--mantine-color-indigo-6)",
        primaryHover: "var(--mantine-color-indigo-7)",
        primaryLight: "var(--mantine-color-indigo-0)",

        // Sémantické (statusové)
        success: "var(--mantine-color-green-7)",
        successLight: "var(--mantine-color-green-0)",
        warning: "var(--mantine-color-yellow-6)",
        warningLight: "var(--mantine-color-yellow-0)",
        danger: "var(--mantine-color-red-7)",
        dangerLight: "var(--mantine-color-red-0)",
        muted: "var(--mantine-color-gray-6)",
    },
    spacing: {
        xs: "var(--mantine-spacing-xs)",
        sm: "var(--mantine-spacing-sm)",
        md: "var(--mantine-spacing-md)",
        lg: "var(--mantine-spacing-lg)",
        xl: "var(--mantine-spacing-xl)",
    },
    radius: {
        sm: "var(--mantine-radius-sm)",
        md: "var(--mantine-radius-md)",
        lg: "var(--mantine-radius-lg)",
        xl: "var(--mantine-radius-xl)",
        pill: "999px",
    },
    // box-shadow neumožňuje light-dark() (jde jen o barvy), proto používáme pure-black
    // s vyšší opacitou — černé stíny jsou viditelné v obou barevných schématech.
    shadow: {
        card: "0 14px 30px rgb(0 0 0 / 0.12), 0 4px 12px rgb(0 0 0 / 0.08)",
        elevated: "0 18px 34px rgb(0 0 0 / 0.18), 0 6px 14px rgb(0 0 0 / 0.1)",
        focusRing: "0 0 0 0.18rem rgb(34 139 230 / 0.16)",
    },
    // Adaptivní hodnoty (light-dark)
    bg: {
        surface: "light-dark(#ffffff, var(--mantine-color-dark-7))",
        elevated: "light-dark(#ffffff, var(--mantine-color-dark-6))",
        subtle: "light-dark(#f8fafd, var(--mantine-color-dark-8))",
        muted: "light-dark(#f1f5f9, var(--mantine-color-dark-6))",
    },
    text: {
        primary: "light-dark(#1f2937, var(--mantine-color-gray-1))",
        muted: "light-dark(var(--mantine-color-gray-6), var(--mantine-color-gray-5))",
        heading: "light-dark(#0f172a, var(--mantine-color-gray-0))",
    },
    border: {
        default: "light-dark(#d6dee9, var(--mantine-color-dark-4))",
        subtle: "light-dark(#e2e8f0, var(--mantine-color-dark-5))",
        strong: "light-dark(#cbd5e1, var(--mantine-color-dark-3))",
    },
    /** Hotové `border` shorthandy (1px solid + adaptivní barva). */
    borderShort: {
        default: "1px solid light-dark(#d6dee9, var(--mantine-color-dark-4))",
        subtle: "1px solid light-dark(#e2e8f0, var(--mantine-color-dark-5))",
        strong: "1px solid light-dark(#cbd5e1, var(--mantine-color-dark-3))",
    },
} as const
