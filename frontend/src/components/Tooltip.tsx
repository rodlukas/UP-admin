import { FontAwesomeIcon, FontAwesomeIconProps } from "@fortawesome/react-fontawesome"
import { faInfoCircle } from "@rodlukas/fontawesome-pro-solid-svg-icons"
import * as React from "react"
import { UncontrolledTooltipProps } from "reactstrap"

import UncontrolledTooltipWrapper from "./UncontrolledTooltipWrapper"

type Props = {
    /** Unikátní textové ID pro Tooltip. */
    postfix: string
    /** Text zobrazený v Tooltipu. */
    text: React.ReactNode
    /** Velikost ikony, která zobrazí Tooltip. */
    size?: FontAwesomeIconProps["size"]
    /** Pozice Tooltipu. */
    placement?: UncontrolledTooltipProps["placement"]
    /** Ikona zobrazená jako trigger Tooltipu (výchozí: faInfoCircle). */
    icon?: FontAwesomeIconProps["icon"]
}

/** Komponenta pro zobrazení titulku po najetí myší nad daný element. */
const Tooltip: React.FC<Props> = ({
    postfix,
    text,
    size = "lg",
    placement = "bottom",
    icon = faInfoCircle,
}) => (
    <>
        <UncontrolledTooltipWrapper placement={placement} target={`Tooltip_${postfix}`}>
            {text}
        </UncontrolledTooltipWrapper>
        <FontAwesomeIcon
            id={`Tooltip_${postfix}`}
            icon={icon}
            className="text-warning"
            size={size}
        />
    </>
)

export default Tooltip
