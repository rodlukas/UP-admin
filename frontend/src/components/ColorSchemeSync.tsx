import { useComputedColorScheme } from "@mantine/core"
import * as React from "react"

// Barva `vars.bg.rail` (frontend/src/theme/tokens.ts) pro každý motiv — `<meta
// name="theme-color">` neumí CSS `light-dark()` ani proměnné, hodnotu proto musí
// duplikovat i tenhle JS. Stejné hodnoty jako `RAIL_COLOR_LIGHT`/`RAIL_COLOR_DARK`
// v admin/static/admin/color-scheme-init.js (ten plain ES5 skript odtud importovat
// nemůže — běží ještě před načtením React aplikace). Při změně tokenu uprav OBĚ místa.
const RAIL_COLOR_LIGHT = "#16233a"
const RAIL_COLOR_DARK = "#0b0f16"

/**
 * Synchronizace inline `style.colorScheme` a `<meta name="theme-color">` na `<html>`
 * s aktuálně aplikovaným schématem. Musí být namountovaná po celou dobu běhu aplikace
 * (tedy i na přihlašovací stránce), jinak by u uživatele s „auto" režimem zůstal inline
 * styl z init scriptu zastaralý po přepnutí OS schématu — proto žije mimo
 * ColorSchemeToggle, který se renderuje jen pro přihlášené uživatele.
 */
const ColorSchemeSync: React.FC = () => {
    // `getInitialValueInEffect: false` – aplikace bezi pouze CSR (zadny SSR/hydration),
    // potrebujeme spravne schema uz pri prvnim renderu, jinak by useEffect nize
    // krátce nastavil `style.colorScheme = "light"` a zpusobil 1-frame flash pro dark uzivatele.
    const computedColorScheme = useComputedColorScheme("light", { getInitialValueInEffect: false })

    // Init script v admin/static/admin/color-scheme-init.js nastavi inline
    // `style.colorScheme` na <html> (kvuli nativnim scrollbarum/form controls bez FOUC).
    // Inline style ma vyssi specificity nez Mantine CSS pravidlo `:root { color-scheme: var(--mantine-color-scheme) }`,
    // takze ho musime presynchronizovat pri runtime prepnuti i pri zmene OS schematu v „auto" rezimu.
    React.useEffect(() => {
        document.documentElement.style.colorScheme = computedColorScheme
    }, [computedColorScheme])

    // Stejny duvod jako u `style.colorScheme` vyse, ale pro `theme-color` meta: init
    // script ji nastavi jen pri prvnim nacteni stranky, takze bez tohohle efektu by
    // runtime prepnuti motivu (rucne v ColorSchemeToggle, nebo zmena OS schematu
    // v "auto" rezimu) nechalo mobilni status bar / PWA chrome na barve puvodniho
    // motivu — presne ten viditelny sev mezi status barem a hlavickou, kvuli kteremu
    // meta tag vubec existuje (viz komentar v head.html).
    React.useEffect(() => {
        const themeColorMeta = document.getElementById("theme-color-meta")
        themeColorMeta?.setAttribute(
            "content",
            computedColorScheme === "dark" ? RAIL_COLOR_DARK : RAIL_COLOR_LIGHT,
        )
    }, [computedColorScheme])

    return null
}

export default ColorSchemeSync
