import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    ActionIcon,
    Menu,
    Tooltip,
    useComputedColorScheme,
    useMantineColorScheme,
} from "@mantine/core"
import type { MantineColorScheme } from "@mantine/core"
import { faDesktop, faMoon, faSun } from "@rodlukas/fontawesome-pro-solid-svg-icons"
import * as React from "react"

import * as styles from "./ColorSchemeToggle.css"

const SCHEME_ICON: Record<MantineColorScheme, typeof faDesktop> = {
    auto: faDesktop,
    light: faSun,
    dark: faMoon,
}

const SCHEME_LABEL: Record<MantineColorScheme, string> = {
    auto: "Systém",
    light: "Světlý",
    dark: "Tmavý",
}

/** Přepínač barevného schématu (Systém / Světlý / Tmavý) v hlavičce. */
const ColorSchemeToggle: React.FC = () => {
    const { colorScheme, setColorScheme } = useMantineColorScheme()
    // `getInitialValueInEffect: false` – aplikace bezi pouze CSR (zadny SSR/hydration),
    // potrebujeme spravne schema uz pri prvnim renderu, jinak by ikona/tooltip
    // v „auto" rezimu na prvni frame ukazovaly nespravne schema.
    // (Resynchronizace inline `style.colorScheme` na <html> zije v ColorSchemeSync,
    // ktery je namountovany vzdy — tato komponenta resi jen UI prepinace.)
    const computedColorScheme = useComputedColorScheme("light", { getInitialValueInEffect: false })

    // theme-color meta nemenime per scheme: navbar je fixne tmavy gradient v obou motivech
    // (viz Main.css.ts), takze i mobile Chrome / PWA status bar drzime na barve horniho
    // okraje navbaru, aby nevznikal viditelny sev mezi status barem a navbarem.

    // V „auto" režimu ukazuj v navbaru ikonu aktuálně aplikovaného schématu
    // (sun/moon), aby bylo na první pohled vidět, co je právě zobrazeno.
    const targetIcon =
        colorScheme === "auto" ? SCHEME_ICON[computedColorScheme] : SCHEME_ICON[colorScheme]
    const tooltipLabel =
        colorScheme === "auto"
            ? `Barevné schéma: Systém (${SCHEME_LABEL[computedColorScheme]})`
            : `Barevné schéma: ${SCHEME_LABEL[colorScheme]}`

    return (
        <Menu shadow="md" position="bottom-end" withinPortal>
            {/* Tooltip musí obalovat Menu.Target (ne naopak): Menu.Target klonuje ARIA
                props (aria-haspopup/expanded/controls) na své přímé dítě a Tooltip by je
                rozprostřel na plovoucí tělo tooltipu místo na trigger tlačítko */}
            <Tooltip label={tooltipLabel} withinPortal>
                <Menu.Target>
                    <ActionIcon
                        variant="subtle"
                        size="lg"
                        className={styles.toggleButton}
                        aria-label="Přepnout barevné schéma"
                        data-qa="color_scheme_toggle">
                        <FontAwesomeIcon icon={targetIcon} />
                    </ActionIcon>
                </Menu.Target>
            </Tooltip>
            <Menu.Dropdown className={styles.dropdown}>
                <Menu.Label>Barevné schéma</Menu.Label>
                {/* menuitemradio polozky musi byt dle ARIA 1.2 seskupene v role="group"
                    (v ramci menu), aby ctecky hlasily kontext skupiny („1 z 3");
                    Mantine zadne group API s touto roli nema, proto obycejny div wrapper. */}
                <div role="group" aria-label="Barevné schéma">
                    {(["auto", "light", "dark"] as MantineColorScheme[]).map((value) => (
                        <Menu.Item
                            key={value}
                            leftSection={<FontAwesomeIcon icon={SCHEME_ICON[value]} fixedWidth />}
                            onClick={() => setColorScheme(value)}
                            data-qa={`color_scheme_${value}`}
                            fw={colorScheme === value ? 600 : 400}
                            // Aktivni schema musi byt rozpoznatelne i pro ctecky obrazovky
                            // (samotne tucne pismo nestaci) — trojice voleb se chova jako
                            // radio skupina: role="menuitemradio" + aria-checked.
                            // Mantine Menu.Item nastavuje role="menuitem" natvrdo az PO
                            // rozprostreni props, takze `role` nelze predat jako prop —
                            // override jde pres polymorfni `renderRoot`.
                            renderRoot={(rootProps) => (
                                <button
                                    type="button"
                                    {...rootProps}
                                    role="menuitemradio"
                                    aria-checked={colorScheme === value}
                                />
                            )}>
                            {SCHEME_LABEL[value]}
                        </Menu.Item>
                    ))}
                </div>
            </Menu.Dropdown>
        </Menu>
    )
}

export default ColorSchemeToggle
