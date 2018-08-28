import React from "react"
import {Button} from "reactstrap"

const SubmitButton = ({content}) =>
    <Button color="primary" className="float-right" type="submit">
        {content}
    </Button>

export default SubmitButton
