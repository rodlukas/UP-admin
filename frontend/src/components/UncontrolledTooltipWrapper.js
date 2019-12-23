import React from "react"
import { UncontrolledTooltip } from "reactstrap"

const UncontrolledTooltipWrapper = ({ placement, children, ...props }) => (
    <UncontrolledTooltip placement={placement || "auto"} {...props}>
        {children}
    </UncontrolledTooltip>
)

export default UncontrolledTooltipWrapper
