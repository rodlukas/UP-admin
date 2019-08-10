import React from "react"
import { Button } from "reactstrap"

const DeleteButton = ({ onClick, content = "", ...props }) => (
    <Button color="danger" onClick={onClick} {...props}>
        Smazat {content}
    </Button>
)

export default DeleteButton
