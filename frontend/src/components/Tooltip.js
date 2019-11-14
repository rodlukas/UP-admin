import { faInfoCircle } from "@fortawesome/pro-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import React, { Fragment } from "react"
import { UncontrolledTooltip } from "reactstrap"

const Tooltip = ({ postfix, text }) => (
    <Fragment>
        <UncontrolledTooltip placement="bottom" target={"Tooltip_" + postfix}>
            {text}
        </UncontrolledTooltip>
        <FontAwesomeIcon
            icon={faInfoCircle}
            className="text-warning"
            size="lg"
            id={"Tooltip_" + postfix}
        />
    </Fragment>
)

export default Tooltip
