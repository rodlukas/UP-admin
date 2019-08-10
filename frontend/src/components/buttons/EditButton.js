import { faPencil } from "@fortawesome/pro-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import React from "react"
import { Button } from "reactstrap"

const EditButton = ({ content = "Upravit", onClick, ...props }) => (
    <Button color="primary" onClick={onClick} {...props} title={content}>
        <FontAwesomeIcon icon={faPencil} />
    </Button>
)

export default EditButton
