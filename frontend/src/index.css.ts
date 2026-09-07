import { globalStyle } from "@vanilla-extract/css"

import { vars } from "./theme/tokens"

// `.main` = app wrapper (Main.tsx)
globalStyle("html, body, .main", {
    backgroundColor: vars.bg.page,
})

/**
 * Odznaky mají v Mantine **vlastní škálu písma** (`--badge-fz-md` je 11 px), která
 * s `theme.fontSizes` nemá nic společného — pravidlo „žádný textový obsah pod 1 rem"
 * by je jinak minulo a `size` prop by ho nespravil, protože jeho hodnoty jsou 9–16 px.
 *
 * Řeší se to proměnnou, ne `font-size`: z ní si Badge odvozuje i odsazení. Výška musí být
 * `auto`, jinak se větší text do pevných 20 px nevejde a ořízne se.
 *
 * POZOR: `size` prop u `Badge` tímhle **přestává být použitelný** — Mantine ho vypisuje
 * jako inline styl, který tohle pravidlo přebije zpátky na 9–16 px.
 */
globalStyle(".mantine-Badge-root", {
    vars: {
        "--badge-fz": "1rem",
        "--badge-height": "auto",
    },
})

globalStyle(".mantine-Badge-label", {
    paddingTop: "0.1rem",
    paddingBottom: "0.1rem",
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
        // viz komentář u light varianty níže
        "--mantine-color-error": "var(--mantine-color-red-4)",
    },
})

/**
 * Zrcadlení dark remapu výše pro light mode: default `dimmed` je gray-6 (#868e96) s kontrastem
 * jen 3.32:1 na bílém povrchu — pod WCAG AA. Remap na gray-7 (#495057) dává 8.18:1 na bílé
 * ploše aplikace. `placeholder` (gray-5, 2.07:1) posouváme o odstín
 * na gray-6 (3.32:1), stejně jako dark remap posouvá placeholder o jeden odstín.
 * Placeholder smí zůstat pod 4.5:1 — WCAG 1.4.3 cílí na běžný text, placeholder je vodítko
 * a musí zůstat vizuálně odlišený od vyplněné hodnoty.
 */
globalStyle(":root[data-mantine-color-scheme='light']", {
    vars: {
        "--mantine-color-dimmed": "var(--mantine-color-gray-7)",
        "--mantine-color-placeholder": "var(--mantine-color-gray-6)",
        /**
         * Šedé `filled`/`outline` varianty (tlačítka Jít zpět, přepínače v Statistikách,
         * šedé odznaky) staví Mantine v light módu na gray-6 (#868e96): bílý text na něm
         * má 3.32:1 a samotný gray-6 text na bílé ploše 3.32:1 — obojí pod WCAG AA.
         * Posun o odstín dává 7.44:1 resp. 8.18:1.
         * Dark mód remap nepotřebuje, tam Mantine používá gray-8 / gray-4.
         */
        "--mantine-color-gray-filled": "var(--mantine-color-gray-7)",
        "--mantine-color-gray-filled-hover": "var(--mantine-color-gray-8)",
        "--mantine-color-gray-outline": "var(--mantine-color-gray-7)",
        "--mantine-color-gray-outline-hover": "var(--mantine-color-gray-0)",
        /**
         * Bílý text na `filled` variantě: indigo-6 dává 4.32:1 a red-6 jen 3.28:1 (obojí
         * pod WCAG AA pro běžný text — týká se primárních tlačítek, zvýrazněné položky
         * Spotlightu i odznaků). Posun o odstín dává 4.98:1 resp. 5.63:1.
         * `autoContrast` to nevyřeší: obě barvy zůstávají pod jeho prahem jasu, takže na
         * nich nechává bílý text. Dark mód remap nepotřebuje (indigo-8 = 5.67:1).
         */
        "--mantine-color-indigo-filled": "var(--mantine-color-indigo-7)",
        "--mantine-color-indigo-filled-hover": "var(--mantine-color-indigo-8)",
        "--mantine-color-red-filled": "var(--mantine-color-red-9)",
        // red-9 je nejtmavší odstín palety, hover proto ztmavuje vlastním hexem (7.43:1)
        "--mantine-color-red-filled-hover": "#a61e1e",
        /**
         * Chybové hlášky pod poli (`error` prop – např. „Vyberte kurz") a hvězdička
         * povinného pole. Mantine je staví na red-6, který má 3.28:1 na bílém povrchu
         * formuláře a 4.13:1 na dark-6 — pod WCAG AA v OBOU schématech. Hodnoty přebíráme
         * ze sémantického tokenu `colors.danger` (light red-9 = 5.46:1, dark red-4 = 5.86:1),
         * ať je chybová červená v aplikaci jen jedna.
         */
        "--mantine-color-error": "var(--mantine-color-red-9)",
    },
})

globalStyle("body", {
    lineHeight: 1.5,
    color: vars.text.primary,
})

// fontWeight tlačítek definuje theme (Button.styles.root v theme.ts), tady jen přechod
globalStyle(".mantine-Button-root", {
    transition: "all 0.15s ease-in-out",
})

// FontAwesome spinner (.fa-spin) nemá vlastní prefers-reduced-motion guard (FA core 1.2.36)
// a respectReducedMotion v Mantine pokrývá jen Mantine přechody, ne tuto CSS animaci. Pro
// uživatele s omezeným pohybem rotaci zastavíme – stav „načítání“ nese tvar ikony + role=status.
globalStyle(".fa-spin", {
    "@media": {
        "(prefers-reduced-motion: reduce)": {
            animation: "none",
        },
    },
})

/**
 * Neaktivní tlačítko: Mantine mu dává gray-2 pozadí, které na bílé ploše splývá do
 * neviditelna — tvar ovládacího prvku musí zůstat čitelný i ve vypnutém stavu
 * (např. „Dnes" v diáři na aktuálním týdnu).
 */
globalStyle(".mantine-Button-root:disabled, .mantine-Button-root[data-disabled]", {
    border: vars.borderShort.default,
})

globalStyle(".mantine-Input-input:focus, .mantine-Textarea-input:focus", {
    borderColor: vars.colors.primary,
    boxShadow: vars.shadow.focusRing,
})

/**
 * `:not([data-variant="unstyled"])` je podstatné: Mantine u varianty `unstyled` jen nastaví
 * `--input-bd: transparent` a rámeček nechává deklarovaný. Bez té výjimky by tohle pravidlo
 * barvu vrátilo a „nestylované" pole by mělo plný box — což rozbíjelo vyplňovací linku
 * u stavu docházky v diáři (AttendanceSelectAttendanceState.css.ts).
 */
globalStyle(
    '.mantine-Input-input:not([data-variant="unstyled"]), .mantine-Textarea-input:not([data-variant="unstyled"])',
    {
        borderColor: vars.border.default,
    },
)

// omezeni max sirky kontejneru
globalStyle(".mantine-Container-root", {
    maxWidth: "1500px",
})

globalStyle("b", {
    fontWeight: 600,
})

// POZOR: platí jen pro holé <h1>–<h3> elementy. Na Mantine <Title> se neaplikuje
// (jeho třída nastavuje margin: 0 s vyšší specificitou) — to je záměr: Title řeší
// odsazení layoutem (Group mb apod.); pokud okraj potřebuje, dej mu lokální třídu.
globalStyle("h1, h2, h3", {
    marginBottom: "0.65rem",
})

globalStyle("label", {
    userSelect: "none",
})

/**
 * Textové odkazy v obsahu. Element selektor (nízká specificita) záměrně — komponenty
 * s vlastní barvou odkazu (navbar, patička nastavení) ho přebijí třídou.
 * Bez tohoto pravidla by odkazy dostaly výchozí barvu prohlížeče včetně fialové
 * `:visited` (autorské pravidlo přebíjí i UA `:visited`).
 */
globalStyle("a", {
    color: vars.colors.link,
})

globalStyle("a:hover", {
    color: vars.colors.linkHover,
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
