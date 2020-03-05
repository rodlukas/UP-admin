import { faInfoCircle } from "@fortawesome/pro-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import * as React from "react"
import UncontrolledTooltipWrapper from "./UncontrolledTooltipWrapper"

type Props = {
    postfix: string
    text: React.ReactNode
}

/** Komponenta pro zobrazení titulku po najetí myší nad daný element. */
const Tooltip: React.FC<Props> = ({ postfix, text }) => (
    <>
        <UncontrolledTooltipWrapper placement="bottom" target={"Tooltip_" + postfix}>
            {text}
        </UncontrolledTooltipWrapper>
        <FontAwesomeIcon
            id={"Tooltip_" + postfix}
            icon={faInfoCircle}
            className="text-warning"
            size="lg"
        />
    </>
)

export default Tooltip
