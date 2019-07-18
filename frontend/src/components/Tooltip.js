import {faInfoCircle} from "@fortawesome/pro-solid-svg-icons"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import React, {Fragment} from "react"
import {UncontrolledTooltip} from "reactstrap"

const Tooltip = ({postfix, text}) =>
    <Fragment>
        <UncontrolledTooltip placement="bottom" target={"tooltip_" + postfix}>
            {text}
        </UncontrolledTooltip>
        <FontAwesomeIcon icon={faInfoCircle} className="text-warning" size="lg"
                         id={"tooltip_" + postfix}/>
    </Fragment>

export default Tooltip
