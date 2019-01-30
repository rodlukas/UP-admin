import React from "react"
import {Button} from "reactstrap"

const EditButton = ({onClick, ...props}) =>
    <Button color="primary" onClick={onClick} {...props}>
        Upravit
    </Button>

export default EditButton
