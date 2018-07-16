import React from "react"
import {Button} from "reactstrap"

const CancelButton = ({onClick}) =>
    <Button color="secondary" onClick={onClick}>
        Storno
    </Button>

export default CancelButton
