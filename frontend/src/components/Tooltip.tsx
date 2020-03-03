import { faInfoCircle } from "@fortawesome/pro-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import * as React from "react"
import UncontrolledTooltipWrapper from "./UncontrolledTooltipWrapper"

type Props = {
    postfix: string
    text: React.ReactNode
}

/** Komponenta pro zobrazení titulku po najetí myší nad daný element. */
const Tooltip: React.FunctionComponent<Props> = ({ postfix, text }) => (
    <>
        <UncontrolledTooltipWrapper placement="bottom" target={"Tooltip_" + postfix}>
            {text}
        </UncontrolledTooltipWrapper>
        <span id={"Tooltip_" + postfix}>
            <FontAwesomeIcon icon={faInfoCircle} className="text-warning" size="lg" />
        </span>
    </>
)

export default Tooltip
