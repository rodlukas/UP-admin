import { useComputedColorScheme } from "@mantine/core"
import * as React from "react"

/**
 * Synchronizace inline `style.colorScheme` na `<html>` s aktuálně aplikovaným schématem.
 * Musí být namountovaná po celou dobu běhu aplikace (tedy i na přihlašovací stránce),
 * jinak by u uživatele s „auto" režimem zůstal inline styl z init scriptu zastaralý
 * po přepnutí OS schématu — proto žije mimo ColorSchemeToggle, který se renderuje
 * jen pro přihlášené uživatele.
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

    return null
}

export default ColorSchemeSync
