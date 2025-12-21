import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPencil } from "@rodlukas/fontawesome-pro-solid-svg-icons"
import * as React from "react"
import { Button, ButtonProps } from "reactstrap"

import { makeIdFromString } from "../../global/utils"
import UncontrolledTooltipWrapper from "../UncontrolledTooltipWrapper"

type Props = ButtonProps & {
    /** Text v tlačítku. */
    content?: string
    /** ID objektu, pro který se zobrazuje tlačítko. */
    contentId: number | string
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
        <UncontrolledTooltipWrapper
            target={`EditButton_${makeIdFromString(content)}_${contentId}`}
            // aby se tooltip po zavreni modalu nezobrazoval
            // vypada to jako nesystemove reseni, ale jde o domenove reseni diky provazanosti modalu a edit buttonu
            trigger="hover">
            {content}
        </UncontrolledTooltipWrapper>
    </>
)

export default EditButton
