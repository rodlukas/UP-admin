import React from "react"
import { Button } from "reactstrap"

const SubmitButton = ({ content, ...props }) => (
    <Button color="primary" className="float-right" type="submit" {...props}>
        {content}
    </Button>
)

export default SubmitButton
