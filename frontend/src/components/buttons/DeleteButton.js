import React from "react"
import {Button} from "reactstrap"

const DeleteButton = ({onClick, title = ''}) =>
    <Button color="danger"
            onClick={onClick}>
        Smazat {title}
    </Button>

export default DeleteButton
