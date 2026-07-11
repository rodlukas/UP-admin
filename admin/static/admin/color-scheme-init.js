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
    try {
        // povolene ulozene hodnoty — cokoliv jineho (poskozena/rucne prepsana hodnota
        // v localStorage) musi spadnout na chovani "auto"
        var KNOWN_SCHEMES = ["light", "dark", "auto"];
        var stored = window.localStorage.getItem("mantine-color-scheme");
        var scheme = KNOWN_SCHEMES.indexOf(stored) !== -1 ? stored : "auto";

        // "auto" = podle aktualniho systemoveho schematu
        var resolved =
            scheme === "auto"
                ? window.matchMedia("(prefers-color-scheme: dark)").matches
                    ? "dark"
                    : "light"
                : scheme;

        document.documentElement.setAttribute("data-mantine-color-scheme", resolved);
        document.documentElement.style.colorScheme = resolved;
    } catch (e) {
        // localStorage/matchMedia nemusi byt dostupne (private mode apod.) — ticha
        // degradace, schema pak nastavi az Mantine po startu aplikace
    }
})();
