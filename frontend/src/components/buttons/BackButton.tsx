import * as React from "react"
import { Button, ButtonProps } from "reactstrap"
import "./BackButton.css"
import "./buttons.css"

type Props = ButtonProps & {
    content?: string
}

/** Tlačítko pro krok zpět v aplikaci. */
const BackButton: React.FC<Props> = ({ onClick, content = "Jít zpět" }) => (
    <Button color="secondary" className="BackButton" onClick={onClick}>
        {content}
    </Button>
)

export default BackButton
