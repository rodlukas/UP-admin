import { faPencil } from "@fortawesome/pro-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import React, { Fragment } from "react"
import { Button, UncontrolledTooltip } from "reactstrap"
import { makeIdFromString } from "../../global/utils"

const EditButton = ({ content = "Upravit", onClick, content_id, ...props }) => (
    <Fragment>
        <Button
            color="primary"
            id={`EditButton_${makeIdFromString(content)}_${content_id}`}
            onClick={onClick}
            {...props}>
            <FontAwesomeIcon icon={faPencil} />
        </Button>
        <UncontrolledTooltip target={`EditButton_${makeIdFromString(content)}_${content_id}`}>
            {content}
        </UncontrolledTooltip>
    </Fragment>
)

export default EditButton
