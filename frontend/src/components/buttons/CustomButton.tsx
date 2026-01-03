import * as React from "react"
import { Button, ButtonProps } from "reactstrap"

import { noop } from "../../global/utils"

type Props = Omit<ButtonProps, "content"> & {
    /** Jakýkoliv uzel JSX tvořící text tlačítka. */
    content: React.ReactNode
}

/** Obecné tlačítko v rámci aplikace. */
const CustomButton: React.FC<Props> = ({
    onClick = noop,
    content = "",
    disabled = false,
    id,
    ...props
}) => (
    <Button color="secondary" disabled={disabled} onClick={onClick} id={id} {...props}>
        {content}
    </Button>
)

export default CustomButton
