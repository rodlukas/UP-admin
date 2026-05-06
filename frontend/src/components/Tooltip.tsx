import { FontAwesomeIcon, FontAwesomeIconProps } from "@fortawesome/react-fontawesome"
import { Tooltip as MantineTooltip, TooltipProps } from "@mantine/core"
import { faInfoCircle } from "@rodlukas/fontawesome-pro-solid-svg-icons"
import * as React from "react"

type Props = {
    /** Text zobrazený v Tooltipu. */
    text: React.ReactNode
    /** Velikost ikony, která zobrazí Tooltip. */
    size?: FontAwesomeIconProps["size"]
    /** Pozice Tooltipu. */
    placement?: TooltipProps["position"]
    /** Ikona zobrazená jako trigger Tooltipu (výchozí: faInfoCircle). */
    icon?: FontAwesomeIconProps["icon"]
}

/** Komponenta pro zobrazení info ikony s titulkem po najetí myší. */
const Tooltip: React.FC<Props> = ({
    text,
    size = "lg",
    placement = "bottom",
    icon = faInfoCircle,
}) => (
    <MantineTooltip label={text} position={placement} withinPortal zIndex={1300}>
        <span>
            <FontAwesomeIcon
                icon={icon}
                color="var(--mantine-color-yellow-6)"
                size={size}
            />
        </span>
    </MantineTooltip>
)

export default Tooltip
