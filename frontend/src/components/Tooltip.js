import {UncontrolledTooltip} from "reactstrap"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faInfoCircle} from "@fortawesome/pro-solid-svg-icons"
import React, {Fragment} from "react"

const Tooltip = ({postfix, text}) =>
    <Fragment>
        <UncontrolledTooltip placement="bottom" target={"tooltip_" + postfix}>
            {text}
        </UncontrolledTooltip>
        <FontAwesomeIcon icon={faInfoCircle} className="text-warning" size="lg"
                         id={"tooltip_" + postfix}/>
    </Fragment>

export default Tooltip
