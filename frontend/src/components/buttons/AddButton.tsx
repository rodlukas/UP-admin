import * as React from "react"
import { Button, ButtonProps } from "reactstrap"
import "./buttons.css"

type Props = ButtonProps & {
    /** Text v tlačítku. */
    content: string
    /** Tlačítko je malé (true). */
    small?: boolean
}

/** Tlačítko pro přidání objektu v aplikaci. */
const AddButton: React.FC<Props> = ({ content, onClick, small = false, ...props }) => {
    const className = `AddButton${small ? " small_button" : ""}`
    return (
        <Button color="info" className={className} onClick={onClick} {...props}>
            {content}
        </Button>
    )
}

export default AddButton
