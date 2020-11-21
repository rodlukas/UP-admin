import * as React from "react"
import { UncontrolledTooltip, UncontrolledTooltipProps } from "reactstrap"

/** Wrapper pro UncontrolledTooltip zajišťující vhodné výchozí hodnoty. */
const UncontrolledTooltipWrapper: React.FC<UncontrolledTooltipProps> = ({
    placement = "auto",
    ...props
}) => <UncontrolledTooltip placement={placement} {...props} />

export default UncontrolledTooltipWrapper
