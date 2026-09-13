import { Button, type ButtonProps } from "@mantine/core"
import * as React from "react"

import { type ClickableButtonProps } from "../../types/types"

type Props = Omit<ButtonProps, "content" | "children"> &
    ClickableButtonProps & {
        /** Text v tlačítku. */
        content?: string
    }

/** Tlačítko pro smazání objektu v aplikaci. */
const DeleteButton: React.FC<Props> = ({ onClick, content = "", ...props }) => (
    <Button color="red" variant="light" onClick={onClick} {...props}>
        Smazat {content}
    </Button>
)

export default DeleteButton
