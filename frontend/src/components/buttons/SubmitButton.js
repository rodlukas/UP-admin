import React from "react"
import {Button} from "reactstrap"

const SubmitButton = ({title}) =>
    <Button color="primary" className="float-right" type="submit">
        {title}
    </Button>

export default SubmitButton
