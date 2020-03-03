import * as React from "react"
import { Button, ButtonProps } from "reactstrap"
import "./BackButton.css"
import "./buttons.css"

interface Props extends ButtonProps {
    content?: string
}

const BackButton: React.FunctionComponent<Props> = ({ onClick, content = "Jít zpět" }) => (
    <Button color="secondary" className="BackButton" onClick={onClick}>
        {content}
    </Button>
)

export default BackButton
