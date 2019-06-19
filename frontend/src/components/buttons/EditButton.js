import React from "react"
import {Button} from "reactstrap"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faPencil} from "@fortawesome/pro-solid-svg-icons"

const EditButton = ({content = "Upravit", onClick, ...props}) =>
    <Button color="primary" onClick={onClick} {...props}>
        <FontAwesomeIcon icon={faPencil} title={content}/>
    </Button>

export default EditButton
