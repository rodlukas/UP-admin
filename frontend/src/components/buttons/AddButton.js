import React from "react"
import {Button} from "reactstrap"
import "./AddButton.css"
import "./buttons.css"

const AddButton = ({title, onClick}) =>
    <Button color="info" className="AddButton" onClick={onClick}>
        {title}
    </Button>

export default AddButton
