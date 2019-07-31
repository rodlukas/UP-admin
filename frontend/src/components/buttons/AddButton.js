import React from "react"
import {Button} from "reactstrap"
import "./buttons.css"

const AddButton = ({content, onClick, small, ...props}) => {
    const className = "AddButton" + (small ? " small_button" : "")
    return (
        <Button color="info" className={className} onClick={onClick} {...props}>
            {content}
        </Button>)
}

export default AddButton
