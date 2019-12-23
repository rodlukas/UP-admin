import { faInfoCircle } from "@fortawesome/pro-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import React, { Fragment } from "react"
import UncontrolledTooltipWrapper from "./UncontrolledTooltipWrapper"

const Tooltip = ({ postfix, text }) => (
    <Fragment>
        <UncontrolledTooltipWrapper placement="bottom" target={"Tooltip_" + postfix}>
            {text}
        </UncontrolledTooltipWrapper>
        <FontAwesomeIcon
            icon={faInfoCircle}
            className="text-warning"
            size="lg"
            id={"Tooltip_" + postfix}
        />
    </Fragment>
)

export default Tooltip
