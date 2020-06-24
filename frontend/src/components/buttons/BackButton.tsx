import * as React from "react"
import { Button, ButtonProps } from "reactstrap"
import "./buttons.css"

type Props = ButtonProps & {
    /** Text v tlačítku. */
    content?: string
}

/** Tlačítko pro krok zpět v aplikaci. */
const BackButton: React.FC<Props> = ({ onClick, content = "Jít zpět" }) => (
    <Button color="secondary" className="BackButton" onClick={onClick}>
        {content}
    </Button>
)

export default BackButton
