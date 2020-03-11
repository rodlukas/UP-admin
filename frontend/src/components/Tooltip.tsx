import { faInfoCircle } from "@fortawesome/pro-solid-svg-icons"
import { FontAwesomeIcon, FontAwesomeIconProps } from "@fortawesome/react-fontawesome"
import * as React from "react"
import { UncontrolledTooltipProps } from "reactstrap"
import UncontrolledTooltipWrapper from "./UncontrolledTooltipWrapper"

type Props = {
    postfix: string
    text: React.ReactNode
    size?: FontAwesomeIconProps["size"]
    placement?: UncontrolledTooltipProps["placement"]
}

/** Komponenta pro zobrazení titulku po najetí myší nad daný element. */
const Tooltip: React.FC<Props> = ({ postfix, text, size = "lg", placement = "bottom" }) => (
    <>
        <UncontrolledTooltipWrapper placement={placement} target={"Tooltip_" + postfix}>
            {text}
        </UncontrolledTooltipWrapper>
        <FontAwesomeIcon
            id={"Tooltip_" + postfix}
            icon={faInfoCircle}
            className="text-warning"
            size={size}
        />
    </>
)

export default Tooltip
