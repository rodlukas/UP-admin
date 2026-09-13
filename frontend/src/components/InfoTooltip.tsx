import { FontAwesomeIcon, type FontAwesomeIconProps } from "@fortawesome/react-fontawesome"
import { Tooltip as MantineTooltip, type TooltipProps } from "@mantine/core"
import { faInfoCircle } from "@rodlukas/fontawesome-pro-solid-svg-icons"
import * as React from "react"

import { dimmedText, iconWarning } from "../global/utility.css"

type CommonProps = {
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

type Props = CommonProps &
    (
        | {
              /** Text zobrazený v Tooltipu, zároveň přístupný popisek pro čtečky obrazovky. */
              text: string
              ariaLabel?: never
          }
        | {
              /** Bohatší obsah Tooltipu (např. zalomení řádku) — `text` samo nejde použít jako
               * přístupný popisek, proto je `ariaLabel` s prostým textovým ekvivalentem povinné. */
              text: React.ReactNode
              ariaLabel: string
          }
    )

/** Komponenta pro zobrazení info ikony s titulkem po najetí myší nebo focusu z klávesnice. */
const InfoTooltip: React.FC<Props> = ({
    text,
    ariaLabel,
    size = "lg",
    placement = "bottom",
    icon = faInfoCircle,
    tone = "warning",
}) => {
    // „warning" = jantarová (upozornění na stav), „info" = neutrální tlumená
    const iconClassName = tone === "warning" ? iconWarning : dimmedText
    return (
        <MantineTooltip label={text} position={placement} withinPortal>
            {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- trigger tooltipu
                musí být fokusovatelný, jinak je obsah jen pro myš (WAI-ARIA tooltip pattern) */}
            <span className={iconClassName} tabIndex={0} role="img" aria-label={ariaLabel ?? text}>
                <FontAwesomeIcon icon={icon} size={size} aria-hidden />
            </span>
        </MantineTooltip>
    )
}

export default InfoTooltip
