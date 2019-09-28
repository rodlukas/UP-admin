import React from "react"
import { Button } from "reactstrap"
import "./BackButton.css"
import "./buttons.css"

const BackButton = ({ onClick, content = "Jít zpět" }) => (
    <Button color="secondary" className="BackButton" onClick={onClick}>
        {content}
    </Button>
)

export default BackButton
