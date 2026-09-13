import { Button, type ButtonProps } from "@mantine/core"
import * as React from "react"

import { type ClickableButtonProps } from "../../types/types"

type Props = Omit<ButtonProps, "children"> & ClickableButtonProps

/** Tlačítko pro storno v rámci aplikace. */
const CancelButton: React.FC<Props> = ({ onClick, ...props }) => (
    <Button variant="default" onClick={onClick} {...props}>
        Storno
    </Button>
)

export default CancelButton
