import * as React from "react"
import { Button, ButtonProps } from "reactstrap"

type Props = ButtonProps & {
    /** Text v tlačítku. */
    content?: string
}

/** Tlačítko pro smazání objektu v aplikaci. */
const DeleteButton: React.FC<Props> = ({ onClick, content = "", ...props }) => (
    <Button color="danger" onClick={onClick} {...props}>
        Smazat {content}
    </Button>
)

export default DeleteButton
