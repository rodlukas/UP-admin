import { Button, ButtonProps } from "@mantine/core"
import * as React from "react"

import { ClickableButtonProps } from "../../types/types"

type Props = Omit<ButtonProps, "content"> &
    ClickableButtonProps & {
        /** Jakýkoliv uzel JSX tvořící text tlačítka. */
        content: React.ReactNode
        disabled?: boolean
        id?: string
    }

/** Obecné tlačítko v rámci aplikace (šedá varianta). */
const CustomButton: React.FC<Props> = ({ onClick, content, disabled = false, id, ...props }) => (
    <Button color="gray" variant="filled" disabled={disabled} onClick={onClick} id={id} {...props}>
        {content}
    </Button>
)

export default CustomButton
