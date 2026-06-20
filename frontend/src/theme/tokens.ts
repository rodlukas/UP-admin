// Sémantické design tokeny aplikace.
// Používejte tyto hodnoty místo hardcoded hex/Mantine variables v .css.ts souborech.
// Single source of truth — pokud chceš změnit barvu povrchu, hraniční čáry, stínu nebo
// rohových rádiusů napříč aplikací, změň ji jen tady.

export const vars = {
    colors: {
        // Primární (značková indigo)
        primary: "var(--mantine-color-indigo-6)",
        // Sémantické (statusové) — light-dark() pro WCAG AA v obou schématech
        // (light varianty jsou tmavší než Mantine paleta, protože green-7 má na bílé jen
        // 2.75:1 a red-7 jen 3.84:1).
        /** Light #2b7a3b = 5.32:1 na bílé (green-9 by měla jen 4.37:1). */
        success: "light-dark(#2b7a3b, var(--mantine-color-green-4))",
        /** Light #246b32 = 6.51:1 na bílé — tmavší než `success`, hover tedy ztmavuje. */
        successHover: "light-dark(#246b32, var(--mantine-color-green-3))",
        /** Solid tmavá zelená pro pozadí pod bílým textem – nesmí měnit barvu mezi motivy
         *  (jinak by `color: white` nesplnil WCAG kontrast v dark módu).
         *  Bílá na #287d38 = 5.15:1 (na green-9 by měla jen 4.37:1). */
        successSolid: "#287d38",
        /** Light #b45309 = 5.02:1 na bílé (yellow-6 má jen 1.86:1) — značí významové ikony. */
        warning: "light-dark(#b45309, var(--mantine-color-yellow-4))",
        /** Light red-9 = 5.46:1 na bílé (red-7 má jen 3.84:1). */
        danger: "light-dark(var(--mantine-color-red-9), var(--mantine-color-red-4))",
        /** Light #a61e1e = 7.43:1 na bílé — tmavší než `danger` (red-9), hover tedy ztmavuje. */
        dangerHover: "light-dark(#a61e1e, var(--mantine-color-red-3))",
    },
    radius: {
        sm: "var(--mantine-radius-sm)",
        md: "var(--mantine-radius-md)",
        lg: "var(--mantine-radius-lg)",
        pill: "999px",
    },
    // box-shadow neumožňuje light-dark() (jde jen o barvy), proto používáme pure-black
    // s vyšší opacitou — černé stíny jsou viditelné v obou barevných schématech.
    shadow: {
        card: "0 14px 30px rgb(0 0 0 / 0.12), 0 4px 12px rgb(0 0 0 / 0.08)",
        elevated: "0 18px 34px rgb(0 0 0 / 0.18), 0 6px 14px rgb(0 0 0 / 0.1)",
        focusRing: "0 0 0 0.18rem rgb(76 110 245 / 0.16)",
    },
    // Adaptivní hodnoty (light-dark)
    bg: {
        /** Pozadí celé stránky pod povrchy — stejné hexy drží i admin/static/admin/index.css
         *  (loader před mountem Reactu), při změně uprav obojí. */
        page: "light-dark(#e9eef5, var(--mantine-color-dark-9))",
        surface: "light-dark(#ffffff, var(--mantine-color-dark-7))",
        elevated: "light-dark(#ffffff, var(--mantine-color-dark-6))",
        subtle: "light-dark(#f8fafd, var(--mantine-color-dark-8))",
        muted: "light-dark(#f1f5f9, var(--mantine-color-dark-6))",
        /** Jemné podbarvení řádku/položky při hoveru na `surface` (dark: o stupeň světlejší). */
        hover: "light-dark(#f4f7fb, var(--mantine-color-dark-6))",
        /** Hover ovládacích prvků na `elevated` povrchu formulářů (dark: o stupeň světlejší). */
        hoverElevated: "light-dark(#f1f5f9, var(--mantine-color-dark-5))",
        /** Jemně tónovaná vnořená plocha na `elevated` povrchu (bloky uvnitř formulářů). */
        subtleElevated: "light-dark(#f8fafc, var(--mantine-color-dark-5))",
        /** Neutrální slate pozadí samostatných ovládacích prvků (šipky v diáři). */
        control: "light-dark(#e2e8f0, var(--mantine-color-dark-5))",
        controlHover: "light-dark(#cbd5e1, var(--mantine-color-dark-4))",
    },
    text: {
        primary: "light-dark(#1f2937, var(--mantine-color-gray-1))",
        /** Light gray-7 = 8.18:1 na bílé (gray-6 má jen 3.32:1). */
        muted: "light-dark(var(--mantine-color-gray-7), var(--mantine-color-gray-5))",
        heading: "light-dark(#0f172a, var(--mantine-color-gray-0))",
        /** Tlumený nadpis (lehce světlejší než `heading` v dark módu). */
        headingSoft: "light-dark(#0f172a, var(--mantine-color-gray-1))",
        /** Sekundární text – chladnější slate, používá se mj. v rámečcích formulářů. */
        slate: "light-dark(#334155, var(--mantine-color-gray-2))",
        /** Tlumený popisek (hint, caption, statistický mezitext). */
        subtleMuted: "light-dark(#64748b, var(--mantine-color-dark-1))",
    },
    border: {
        default: "light-dark(#d6dee9, var(--mantine-color-dark-4))",
        strong: "light-dark(#cbd5e1, var(--mantine-color-dark-3))",
        /** Tlumený oddělovač sekcí formuláře. */
        formDivider: "light-dark(#edf2f7, var(--mantine-color-dark-4))",
    },
    /** Hotové `border` shorthandy (1px solid + adaptivní barva). */
    borderShort: {
        default: "1px solid light-dark(#d6dee9, var(--mantine-color-dark-4))",
        /** Tlumený oddělovač sekcí formuláře. */
        formDivider: "1px solid light-dark(#edf2f7, var(--mantine-color-dark-4))",
        /** Měkká žlutá hraniční čára pro varovné/zastaralé alerty. */
        warningSoft: "1px solid light-dark(#f3d38a, var(--mantine-color-yellow-7))",
    },
    /**
     * Bledá statusová podbarvení infoboxů a sekcí formulářů — `bg` pozadí,
     * `border` jemný rámeček (1px) a `accent` výrazná levá linka (3px).
     * Sytější stavová podbarvení lekcí viz `statusTint` níže.
     */
    statusSoft: {
        info: {
            bg: "light-dark(#f8fbff, var(--mantine-color-dark-5))",
            border: "1px solid light-dark(#dbeafe, var(--mantine-color-blue-9))",
            accent: "3px solid light-dark(#60a5fa, var(--mantine-color-blue-6))",
        },
        warning: {
            bg: "light-dark(#fffaf0, var(--mantine-color-dark-5))",
            border: "1px solid light-dark(#fde7c7, var(--mantine-color-orange-9))",
            accent: "3px solid light-dark(#f59e0b, var(--mantine-color-yellow-7))",
        },
        danger: {
            // dark pozadí dark-6 (ne dark-5) — danger zóna sedí přímo na elevated sekci formuláře
            bg: "light-dark(#fff8f9, var(--mantine-color-dark-6))",
            border: "1px solid light-dark(#ffe0e5, var(--mantine-color-red-9))",
            accent: "3px solid light-dark(#fa8ea0, var(--mantine-color-red-6))",
        },
    },
    /**
     * Sytější stavové podbarvení lekcí (budoucí/předplacená/zrušená) — záměrně výraznější
     * než `statusSoft`, stav lekce musí být rozpoznatelný i bez rámečku a textu.
     * Dark varianty ztlumené přes color-mix s dark-7: plná sytost (yellow-9/green-8/red-9)
     * by srazila kontrast indigo odkazů (#9e9eff) na podbarvené lekci pod WCAG AA
     * (např. red-9: 2.28:1); s mixem se kontrast drží na prahu AA (success/danger ≥4.5:1,
     * warning ~4.4:1) a světlý text ≥10:1.
     */
    statusTint: {
        warning:
            "light-dark(#fff8dd, color-mix(in srgb, var(--mantine-color-yellow-9) 25%, var(--mantine-color-dark-7)))",
        success:
            "light-dark(#ddf6e4, color-mix(in srgb, var(--mantine-color-green-8) 25%, var(--mantine-color-dark-7)))",
        danger: "light-dark(#f8d7da, color-mix(in srgb, var(--mantine-color-red-9) 30%, var(--mantine-color-dark-7)))",
    },
} as const
