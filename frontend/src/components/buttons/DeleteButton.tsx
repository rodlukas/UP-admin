import * as React from "react"
import { Button, ButtonProps } from "reactstrap"

interface Props extends ButtonProps {
    content?: string
}

/** Tlačítko pro smazání objektu v aplikaci. */
const DeleteButton: React.FunctionComponent<Props> = ({ onClick, content = "", ...props }) => (
    <Button color="danger" onClick={onClick} {...props}>
        Smazat {content}
    </Button>
)

export default DeleteButton
