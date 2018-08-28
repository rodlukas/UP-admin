import React from "react"
import {Button} from "reactstrap"

const DeleteButton = ({onClick, content = ''}) =>
    <Button color="danger"
            onClick={onClick}>
        Smazat {content}
    </Button>

export default DeleteButton
