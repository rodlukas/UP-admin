import React from "react"
import {Button} from "reactstrap"
import "./AddButton.css"
import "./buttons.css"

const AddButton = ({content, onClick}) =>
    <Button color="info" className="AddButton" onClick={onClick}>
        {content}
    </Button>

export default AddButton
