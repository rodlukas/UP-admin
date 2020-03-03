import * as React from "react"
import { UncontrolledTooltip, UncontrolledTooltipProps } from "reactstrap"

const UncontrolledTooltipWrapper: React.FunctionComponent<UncontrolledTooltipProps> = ({
    placement = "auto",
    children,
    ...props
}) => (
    <UncontrolledTooltip placement={placement} {...props}>
        {children}
    </UncontrolledTooltip>
)

export default UncontrolledTooltipWrapper
