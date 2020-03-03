import * as React from "react"
import { UncontrolledTooltip, UncontrolledTooltipProps } from "reactstrap"

/** Wrapper pro UncontrolledTooltip zajišťující vhodné výchozí hodnoty. */
const UncontrolledTooltipWrapper: React.FC<UncontrolledTooltipProps> = ({
    placement = "auto",
    children,
    ...props
}) => (
    <UncontrolledTooltip placement={placement} {...props}>
        {children}
    </UncontrolledTooltip>
)

export default UncontrolledTooltipWrapper
