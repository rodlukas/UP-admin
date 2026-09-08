// Sémantické design tokeny aplikace.
// Používejte tyto hodnoty místo hardcoded hex/Mantine variables v .css.ts souborech.
// Single source of truth — pokud chceš změnit barvu povrchu, hraniční čáry, stínu nebo
// rohových rádiusů napříč aplikací, změň ji jen tady.
//
// Vizuální jazyk: inkoustový pruh navigace vlevo, obsah na jedné bílé (v tmavém režimu
// tmavě inkoustové) ploše. Obsah se nedělí do karet — dělí ho vlasové linky (`border.default`)
// a bílé místo. Stín má proto jen to, co se nad plochu skutečně zvedá: modal, dropdown,
// Spotlight. Tmavá paleta `dark-*` je v theme.ts přebarvená do inkoustové škály, takže
// odkazy na `--mantine-color-dark-N` níže drží stejný odstín jako vlastní hexy.

export const vars = {
    colors: {
        // Primární (značková indigo)
        primary: "var(--mantine-color-indigo-6)",
        // Sémantické (statusové) — light-dark() pro WCAG AA v obou schématech
        /** Light #2b7a3b = 5.32:1 na bílé ploše. */
        success: "light-dark(#2b7a3b, var(--mantine-color-green-4))",
        /** Light #246b32 = 6.51:1 na bílé — tmavší než `success`, hover tedy ztmavuje. */
        successHover: "light-dark(#246b32, var(--mantine-color-green-3))",
        /** Solid tmavá zelená pro pozadí pod bílým textem – nesmí měnit barvu mezi motivy
         *  (jinak by `color: white` nesplnil WCAG kontrast v dark módu).
         *  Bílá na #287d38 = 5.15:1. */
        successSolid: "#287d38",
        /** Light #b45309 = 5.02:1 na bílé ploše (yellow-6 má jen 1.86:1). */
        warning: "light-dark(#b45309, var(--mantine-color-yellow-4))",
        /** Light red-9 = 7.81:1 na bílé ploše (red-7 má jen 3.84:1). */
        danger: "light-dark(var(--mantine-color-red-9), var(--mantine-color-red-4))",
        /** Light #a61e1e = 7.43:1 na bílé — tmavší než `danger`, hover tedy ztmavuje. */
        dangerHover: "light-dark(#a61e1e, var(--mantine-color-red-3))",
        /**
         * Barva textových odkazů v obsahu (globální pravidlo pro `a` v index.css.ts).
         * Light indigo-9 = 9.69:1 na bílé ploše a 5.07:1 i na nejtmavším podkladu, na kterém
         * odkaz stojí (`statusTint.danger`); dark indigo-3 = 6.98:1 na ploše a 5.09:1
         * na nejtmavším z `statusTint` (warning).
         */
        link: "light-dark(var(--mantine-color-indigo-9), var(--mantine-color-indigo-3))",
        /** O stupeň výraznější odstín pro hover (light tmavší, dark světlejší). */
        linkHover: "light-dark(#2b3f9e, var(--mantine-color-indigo-2))",
    },
    radius: {
        sm: "var(--mantine-radius-sm)",
        md: "var(--mantine-radius-md)",
        lg: "var(--mantine-radius-lg)",
        pill: "999px",
    },
    /**
     * Stíny patří jen plovoucím vrstvám. `card` a `elevated` zůstávají v tokenech pro
     * modaly a dropdowny — na obsah stránky se nepoužívají, tam nese oddělení
     * `border.default`. box-shadow neumí light-dark() (jde jen o barvy), proto pure-black
     * s vyšší opacitou — černé stíny jsou viditelné v obou barevných schématech.
     */
    shadow: {
        card: "0 14px 30px rgb(0 0 0 / 0.12), 0 4px 12px rgb(0 0 0 / 0.08)",
        elevated: "0 24px 60px rgb(0 0 0 / 0.22), 0 4px 12px rgb(0 0 0 / 0.1)",
        /** Jemný stín samostatných ovládacích prvků. */
        control: "0 4px 10px rgb(0 0 0 / 0.1)",
        focusRing: "0 0 0 0.18rem rgb(76 110 245 / 0.16)",
    },
    // Adaptivní hodnoty (light-dark)
    bg: {
        /**
         * Plocha celé aplikace. Jemně tónovaná, ne bílá: obsah leží v panelech na
         * `bg.surface` (bílá / dark-7) a na bílé ploše by od nich nebyla k rozeznání —
         * bílé bloky na bílém pozadí splývaly a nebylo poznat, kde blok začíná a končí.
         *
         * Stejné hexy drží i admin/static/admin/index.css (loader před mountem Reactu),
         * při změně uprav obojí (`dark-8` = #141a24).
         *
         * Nese i zebru tabulek (`stripedColor` v theme.ts) — podbarvený řádek je tón
         * plochy stránky, tedy v obou režimech krok od povrchu panelu směrem k ploše
         * (1.075:1 v light, 1.093:1 v dark). Při změně odstínu přepočítej kontrasty
         * textu na zebře, ne jen ty vůči povrchu panelu.
         */
        page: "light-dark(#f4f7fb, var(--mantine-color-dark-8))",
        surface: "light-dark(#ffffff, var(--mantine-color-dark-7))",
        /** Povrch plovoucích vrstev (modal, dropdown) — o stupeň nad plochou. */
        elevated: "light-dark(#ffffff, var(--mantine-color-dark-6))",
        subtle: "light-dark(#f7f9fc, var(--mantine-color-dark-8))",
        muted: "light-dark(#f1f4f9, var(--mantine-color-dark-6))",
        /** Jemné podbarvení řádku/položky při hoveru na ploše. */
        hover: "light-dark(#f4f6fb, var(--mantine-color-dark-6))",
        /**
         * Hover řádku tabulky. Vlastní odstín, protože musí být krok i proti zebře
         * (`bg.page`, viz `Table` v theme.ts), ne jen proti povrchu panelu — na
         * `bg.hover` by se hover na podbarveném řádku ztratil. Krok proti zebře
         * 1.075:1 (light) a 1.273:1 (dark), proti panelu 1.155:1 a 1.164:1.
         *
         * Dark odstín je mimo škálu `dark-*` schválně, aby ten krok proti panelu držel
         * v obou schématech stejnou váhu: `dark-5` by měl 1.289:1, tedy hover hlasitější
         * v tmavém režimu než ve světlém. Nic jiného tenhle odstín nečte, takže vazba
         * dark tónů na paletu tu nic nedrží.
         *
         * Text na hoveru: light `primary` 13.62:1, `muted` 6.72:1, `subtleMuted` 4.92:1,
         * `dimmed` (gray-7) 7.08:1, odkaz (indigo-9) 8.03:1; dark `dark-0` 11.56:1,
         * `dimmed` (dark-1) 6.13:1, odkaz (indigo-3) 5.99:1.
         */
        tableRowHover: "light-dark(#eaeff7, #242e3c)",
        /** Hover ovládacích prvků na `elevated` povrchu formulářů. */
        hoverElevated: "light-dark(#f1f4f9, var(--mantine-color-dark-5))",
        /** Jemně tónovaná vnořená plocha na `elevated` povrchu (bloky uvnitř formulářů). */
        subtleElevated: "light-dark(#f8fafc, var(--mantine-color-dark-5))",
        /** Neutrální pozadí samostatných ovládacích prvků. */
        control: "light-dark(#eef1f6, var(--mantine-color-dark-5))",
        controlHover: "light-dark(#e2e7ef, var(--mantine-color-dark-4))",
        /**
         * Inkoustový pruh navigace — jediné chrome aplikace. V obou schématech je to
         * nejtmavší plocha na obrazovce; v tmavém režimu je krok proti ploše jen 1.2:1,
         * proto má pruh navíc `border.rail` na pravé hraně (viz Main.css.ts).
         */
        rail: "light-dark(#16233a, var(--mantine-color-dark-9))",
        /** Hover a aktivní položka v pruhu — průsvitná bílá funguje na obou odstínech pruhu. */
        railHover: "rgb(255 255 255 / 0.09)",
        railActive: "rgb(255 255 255 / 0.13)",
    },
    text: {
        /** #16233a = 15.72:1 na bílé ploše; dark-0 = 13.46:1 na tmavé ploše. */
        primary: "light-dark(#16233a, var(--mantine-color-dark-0))",
        /** #46536a = 7.76:1 na bílé ploše; dark-1 = 7.13:1 na tmavé ploše. */
        muted: "light-dark(#46536a, var(--mantine-color-dark-1))",
        /** #101a2c = 17.41:1 na bílé ploše. */
        heading: "light-dark(#101a2c, var(--mantine-color-dark-0))",
        /** Tlumený nadpis (lehce světlejší než `heading` v dark módu). */
        headingSoft: "light-dark(#101a2c, var(--mantine-color-dark-0))",
        /** Sekundární text – chladnější slate, používá se mj. v rámečcích formulářů. */
        slate: "light-dark(#334155, var(--mantine-color-dark-1))",
        /**
         * Tlumený popisek (hint, caption, statistický mezitext).
         * Light #5b6878 = 5.68:1 na bílé ploše; dark-2 = 5.35:1 na tmavé ploše.
         * `dark-3` se na text použít NESMÍ — má jen 3.52:1, je to odstín pro linky a ikony.
         */
        subtleMuted: "light-dark(#5b6878, var(--mantine-color-dark-2))",
        /** Text v inkoustovém pruhu: tlumený 7.68:1, výrazný 14.91:1 na pruhu. */
        rail: "rgb(233 238 247 / 0.74)",
        railStrong: "#f7f9fc",
    },
    border: {
        /** Vlasová linka — nosič oddělení obsahu místo rámečků karet. */
        default: "light-dark(#e3e7ee, var(--mantine-color-dark-4))",
        strong: "light-dark(#ccd3de, var(--mantine-color-dark-3))",
        /** Tlumený oddělovač sekcí formuláře. */
        formDivider: "light-dark(#edf1f6, var(--mantine-color-dark-4))",
        /** Hrana inkoustového pruhu — v tmavém režimu jediné, co pruh od plochy odděluje. */
        rail: "rgb(255 255 255 / 0.11)",
    },
    /** Hotové `border` shorthandy (1px solid + adaptivní barva). */
    borderShort: {
        default: "1px solid light-dark(#e3e7ee, var(--mantine-color-dark-4))",
        strong: "1px solid light-dark(#ccd3de, var(--mantine-color-dark-3))",
        /** Tlumený oddělovač sekcí formuláře. */
        formDivider: "1px solid light-dark(#edf1f6, var(--mantine-color-dark-4))",
        /** Měkká žlutá hraniční čára pro varovné/zastaralé alerty. */
        warningSoft: "1px solid light-dark(#f3d38a, var(--mantine-color-yellow-7))",
    },
    /**
     * Bledá statusová podbarvení infoboxů a sekcí formulářů — `bg` pozadí,
     * `border` jemný rámeček (1px) a `accent` výrazná levá linka (3px).
     *
     * V tmavém režimu je `border` vlasová linka (`dark-4`), ne sytý odstín statusu:
     * na inkoustové ploše dělal syté orange-9/red-9 obtažení z notice zvýrazněný box,
     * hlasitější než obsah, o kterém informuje. Význam nese `accent`, rámeček jen odděluje.
     * Sytější stavová podbarvení lekcí viz `statusTint` níže.
     */
    statusSoft: {
        info: {
            bg: "light-dark(#f5f9ff, var(--mantine-color-dark-5))",
            border: "1px solid light-dark(#dbeafe, var(--mantine-color-dark-4))",
            accent: "3px solid light-dark(#60a5fa, var(--mantine-color-blue-6))",
        },
        warning: {
            bg: "light-dark(#fffaf0, var(--mantine-color-dark-5))",
            border: "1px solid light-dark(#fde7c7, var(--mantine-color-dark-4))",
            accent: "3px solid light-dark(#f59e0b, var(--mantine-color-yellow-7))",
        },
        /**
         * Sytější varianta pro bannery, kde barva nese hlavní signál (neaktivní klient/skupina)
         * a text pod ní je automatická barva Mantine `Alert` (černá/bílá), ne `text.slate` —
         * proto může mít sytější podklad než `warning` výše, aniž by to srazilo kontrast textu
         * pod WCAG AA (změřeno: černá na `yellow-light` v light módu 9,3:1, bílá na `yellow-light`
         * v dark módu 8,9:1). `warning` zůstává měkčí, protože ho používá i `warningNotice`
         * (FormLectures) s `text.slate` — tak syté pozadí by mu kontrast srazilo pod 4,5:1.
         */
        warningStrong: {
            bg: "var(--mantine-color-yellow-light)",
            border: "1px solid var(--mantine-color-yellow-light-hover)",
            accent: "3px solid var(--mantine-color-yellow-7)",
        },
        danger: {
            // dark pozadí dark-6 (ne dark-5) — danger zóna sedí přímo na elevated sekci formuláře
            bg: "light-dark(#fff7f8, var(--mantine-color-dark-6))",
            border: "1px solid light-dark(#ffe0e5, var(--mantine-color-dark-4))",
            accent: "3px solid light-dark(#fa8ea0, var(--mantine-color-red-6))",
        },
    },
    /**
     * Stavové podbarvení lekcí (budoucí/předplacená/zrušená). Stav lekce musí být
     * rozpoznatelný i bez rámečku a textu, takže podbarvení nese i plochý jazyk. Je
     * záměrně tlumené: stojí na bílé ploše a význam vedle něj nese textový štítek, takže
     * barva není jediný nositel informace (WCAG 1.4.1).
     * Dark varianty ztlumené přes color-mix s plochou: plná sytost by srazila kontrast
     * indigo odkazů na podbarvené lekci pod WCAG AA. S mixem drží odkaz (indigo-3)
     * 5.09:1 (warning), 5.43:1 (success) a 5.85:1 (danger), běžný text (dark-0) ≥9.8:1.
     *
     * Light `success` byl původně #eef7f1 — na bílé ploše (`bg.surface`) to vyšlo na
     * kontrast jen ~1.09:1 vůči bílé, tedy prakticky neviditelné podbarvení (na rozdíl od
     * `warning`/`danger`, které díky posunu v modrém/zeleném kanálu čitelně vypadají jako
     * barva, ne jen odstín bílé). #d3ecdd drží stejnou roli jako u ostatních dvou stavů:
     * indigo odkaz (indigo-9) na něm má 5.42:1, tmavý text (`text.heading`) ještě víc.
     */
    statusTint: {
        warning:
            "light-dark(#fdf8e7, color-mix(in srgb, var(--mantine-color-yellow-9) 22%, var(--mantine-color-dark-7)))",
        success:
            "light-dark(#d3ecdd, color-mix(in srgb, var(--mantine-color-green-8) 22%, var(--mantine-color-dark-7)))",
        danger: "light-dark(#fdf1f3, color-mix(in srgb, var(--mantine-color-red-9) 26%, var(--mantine-color-dark-7)))",
    },
} as const
