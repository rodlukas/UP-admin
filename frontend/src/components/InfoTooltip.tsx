import { FontAwesomeIcon, FontAwesomeIconProps } from "@fortawesome/react-fontawesome"
import { Tooltip as MantineTooltip, TooltipProps } from "@mantine/core"
import { faInfoCircle } from "@rodlukas/fontawesome-pro-solid-svg-icons"
import * as React from "react"

import { dimmedText, iconWarning } from "../global/utility.css"

/** Přístupný popisek ikony pro čtečky obrazovky. */
const LABEL = "Doplňující informace"

type Props = {
    /** Text zobrazený v Tooltipu. */
    text: React.ReactNode
    /** Velikost ikony, která zobrazí Tooltip. */
    size?: FontAwesomeIconProps["size"]
    /** Pozice Tooltipu. */
    placement?: TooltipProps["position"]
    /** Ikona zobrazená jako trigger Tooltipu (výchozí: faInfoCircle). */
    icon?: FontAwesomeIconProps["icon"]
    /**
     * Vizuální tón ikony. Výchozí „warning" (jantarová) – většina tooltipů upozorňuje na stav
     * typu „neaktivní / nelze / zastaralé". Pro čistě vysvětlující text použij „info" (neutrální),
     * aby ikona nebudila dojem varování.
     */
    tone?: "info" | "warning"
}

/** Komponenta pro zobrazení info ikony s titulkem po najetí myší nebo focusu z klávesnice. */
const InfoTooltip: React.FC<Props> = ({
    text,
    size = "lg",
    placement = "bottom",
    icon = faInfoCircle,
    tone = "warning",
}) => {
    // „warning" = jantarová (upozornění na stav), „info" = neutrální tlumená
    const iconClassName = tone === "warning" ? iconWarning : dimmedText
    return (
        <MantineTooltip
            label={text}
            position={placement}
            withinPortal
            // focus + tabIndex: obsah tooltipu musí být dosažitelný i z klávesnice (WCAG 1.4.13)
            events={{ hover: true, focus: true, touch: true }}>
            {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- trigger tooltipu
                musí být fokusovatelný, jinak je obsah jen pro myš (WAI-ARIA tooltip pattern) */}
            <span className={iconClassName} tabIndex={0} role="img" aria-label={LABEL}>
                <FontAwesomeIcon icon={icon} size={size} aria-hidden />
            </span>
        </MantineTooltip>
    )
}

export default InfoTooltip
