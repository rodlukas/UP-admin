import { faPencil } from "@fortawesome/pro-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import * as React from "react"
import { Button, ButtonProps } from "reactstrap"
import { makeIdFromString } from "../../global/utils"
import UncontrolledTooltipWrapper from "../UncontrolledTooltipWrapper"

type Props = ButtonProps & {
    /** Text v tlačítku. */
    content?: string
}

/** Tlačítko pro úpravu objektu v aplikaci. */
const EditButton: React.FC<Props> = ({ content = "Upravit", onClick, contentId, ...props }) => (
    <>
        <Button
            color="primary"
            id={`EditButton_${makeIdFromString(content)}_${contentId}`}
            onClick={onClick}
            {...props}>
            <FontAwesomeIcon icon={faPencil} />
        </Button>
        <UncontrolledTooltipWrapper target={`EditButton_${makeIdFromString(content)}_${contentId}`}>
            {content}
        </UncontrolledTooltipWrapper>
    </>
)

export default EditButton
