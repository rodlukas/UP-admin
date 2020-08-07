import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus } from "@rodlukas/fontawesome-pro-solid-svg-icons"
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
            <FontAwesomeIcon icon={faPlus} className="btn_icon" />
            {content}
        </Button>
    )
}

export default AddButton
