import React from "react"
import {Button} from "reactstrap"
import "./AddButton.css"
import "./buttons.css"

const AddButton = ({content, onClick, ...props}) =>
    <Button color="info" className="AddButton" onClick={onClick} {...props}>
        {content}
    </Button>

export default AddButton
