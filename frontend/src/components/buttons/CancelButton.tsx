import { Button, ButtonProps } from "@mantine/core"
import * as React from "react"

type Props = Omit<ButtonProps, "children"> & {
    onClick?: React.MouseEventHandler<HTMLButtonElement>
}

/** Tlačítko pro storno v rámci aplikace. */
const CancelButton: React.FC<Props> = ({ onClick, ...props }) => (
    <Button variant="default" onClick={onClick} {...props}>
        Storno
    </Button>
)

export default CancelButton
