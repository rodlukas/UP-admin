// Inicializace barevneho schematu jeste PRED prvnim vykreslenim stranky (zabrana FOUC
// u dark uzivatelu). Musi zustat maly synchronni ES5 skript bez modulu — bezi driv,
// nez se nacte React aplikace i Mantine.
//
// Semantika musi presne odpovidat Mantine (@mantine/core):
// - stejny localStorage klic "mantine-color-scheme" — toto je EXPLICITNI override nastaveny v
//   index.tsx (konstanta COLOR_SCHEME_STORAGE_KEY); Mantine ma jinak vychozi klic
//   "mantine-color-scheme-value". Pri zmene klice je nutne upravit OBE mista (tento skript je
//   plain ES5 a nemuze konstantu importovat); shodu hlida test ColorSchemeToggle.test.tsx,
// - "auto" se ridi systemovym nastavenim (prefers-color-scheme),
// - nastavuje se atribut data-mantine-color-scheme (na nej cili Mantine CSS)
//   + inline style color-scheme (kvuli nativnim scrollbarum/form controls bez FOUC).
(function () {
    // Barva `vars.bg.rail` (frontend/src/theme/tokens.ts) pro kazdy motiv - `<meta
    // name="theme-color">` neumi CSS `light-dark()` ani promenne, hodnotu proto musi
    // duplikovat i tenhle plain ES5 skript. Pri zmene tokenu uprav i tady.
    var RAIL_COLOR_LIGHT = "#16233a";
    var RAIL_COLOR_DARK = "#0b0f16";

    try {
        // povolene ulozene hodnoty — cokoliv jineho (poskozena/rucne prepsana hodnota
        // v localStorage, nebo chybejici hodnota) musi spadnout na vychozi "light"
        var KNOWN_SCHEMES = ["light", "dark", "auto"];
        var stored = window.localStorage.getItem("mantine-color-scheme");
        // `indexOf`, ne `Array.prototype.includes` (ES2016) — soubor musi zustat ES5,
        // viz komentar v hlavicce; `includes` by na starsim enginu vyhodil TypeError,
        // ktery by zachytil catch nize jako "ticha degradace" a cely tenhle FOUC-fix
        // by se tak nenapadne prestal spoustet.
        var scheme = KNOWN_SCHEMES.indexOf(stored) !== -1 ? stored : "light";

        // "auto" = podle aktualniho systemoveho schematu
        var resolved = scheme;
        if (scheme === "auto") {
            resolved = window.matchMedia("(prefers-color-scheme: dark)").matches
                ? "dark"
                : "light";
        }

        document.documentElement.dataset.mantineColorScheme = resolved;
        document.documentElement.style.colorScheme = resolved;

        // drzi `theme-color` v kroku s `bg.rail` (viz komentar v head.html) - bez tohoto
        // kroku by v tmavem motivu zustal staticky `content` z <head> (svetla hodnota)
        // a vznikl by viditelny sev mezi status barem a hlavickou aplikace
        var themeColorMeta = document.getElementById("theme-color-meta");
        if (themeColorMeta) {
            themeColorMeta.setAttribute(
                "content",
                resolved === "dark" ? RAIL_COLOR_DARK : RAIL_COLOR_LIGHT,
            );
        }
    } catch (e) {
        // localStorage/matchMedia nemusi byt dostupne (private mode apod.) — ticha
        // degradace, schema pak nastavi az Mantine po startu aplikace
    }
})();
