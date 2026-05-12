import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { ActionIcon, Menu, Tooltip, useComputedColorScheme, useMantineColorScheme } from "@mantine/core"
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
    const computedColorScheme = useComputedColorScheme("light", { getInitialValueInEffect: true })

    // V „auto" režimu ukazuj v navbaru ikonu aktuálně aplikovaného schématu
    // (sun/moon), aby bylo na první pohled vidět, co je právě zobrazeno.
    const targetIcon = colorScheme === "auto" ? SCHEME_ICON[computedColorScheme] : SCHEME_ICON[colorScheme]
    const tooltipLabel =
        colorScheme === "auto"
            ? `Barevné schéma: Systém (${SCHEME_LABEL[computedColorScheme]})`
            : `Barevné schéma: ${SCHEME_LABEL[colorScheme]}`

    return (
        <Menu shadow="md" position="bottom-end" withinPortal>
            <Menu.Target>
                <Tooltip label={tooltipLabel} withinPortal>
                    <ActionIcon
                        variant="subtle"
                        size="lg"
                        className={styles.toggleButton}
                        aria-label="Přepnout barevné schéma"
                        data-qa="color_scheme_toggle">
                        <FontAwesomeIcon icon={targetIcon} />
                    </ActionIcon>
                </Tooltip>
            </Menu.Target>
            <Menu.Dropdown className={styles.dropdown}>
                <Menu.Label>Barevné schéma</Menu.Label>
                {(["auto", "light", "dark"] as MantineColorScheme[]).map((value) => (
                    <Menu.Item
                        key={value}
                        leftSection={<FontAwesomeIcon icon={SCHEME_ICON[value]} fixedWidth />}
                        onClick={() => setColorScheme(value)}
                        data-qa={`color_scheme_${value}`}
                        fw={colorScheme === value ? 600 : 400}>
                        {SCHEME_LABEL[value]}
                    </Menu.Item>
                ))}
            </Menu.Dropdown>
        </Menu>
    )
}

export default ColorSchemeToggle
