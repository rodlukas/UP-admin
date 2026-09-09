import { Button, ButtonProps } from "@mantine/core"
import * as React from "react"

type Props = Omit<ButtonProps, "content" | "children"> & {
    /** Text v tlačítku. */
    content?: string
    onClick?: React.MouseEventHandler<HTMLButtonElement>
}

/** Tlačítko pro smazání objektu v aplikaci. */
const DeleteButton: React.FC<Props> = ({ onClick, content = "", ...props }) => (
    <Button color="red" variant="light" onClick={onClick} {...props}>
        Smazat {content}
    </Button>
)

export default DeleteButton
