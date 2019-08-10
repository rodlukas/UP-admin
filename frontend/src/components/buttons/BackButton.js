import React from "react"
import { Button } from "reactstrap"
import "./BackButton.css"
import "./buttons.css"

const BackButton = ({ onClick }) => (
    <Button color="secondary" className="BackButton" onClick={onClick}>
        Jít zpět
    </Button>
)

export default BackButton
