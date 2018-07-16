import React from "react"
import {Button} from "reactstrap"

const AddButton = ({title, onClick}) =>
    <Button color="info" className="addBtn" onClick={onClick}>
        {title}
    </Button>

export default AddButton
