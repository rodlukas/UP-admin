import React from "react"
import { Button } from "reactstrap"

const CustomButton = ({
    onClick = () => {},
    content = "",
    disabled = false,
    title = "",
    ...props
}) => (
    <Button color="secondary" disabled={disabled} title={title} onClick={onClick} {...props}>
        {content}
    </Button>
)

export default CustomButton
