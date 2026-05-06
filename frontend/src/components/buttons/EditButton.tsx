import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Button, ButtonProps, Tooltip } from "@mantine/core"
import { faPencil } from "@rodlukas/fontawesome-pro-solid-svg-icons"
import * as React from "react"

import { makeIdFromString } from "../../global/utils"

type Props = Omit<ButtonProps, "content" | "children"> & {
    /** Text v tlačítku. */
    content?: string
    /** ID objektu, pro který se zobrazuje tlačítko. */
    contentId: number | string
    onClick?: React.MouseEventHandler<HTMLButtonElement>
}

/** Tlačítko pro úpravu objektu v aplikaci. */
const EditButton: React.FC<Props> = ({ content = "Upravit", onClick, contentId, ...props }) => (
    <Tooltip
        label={content}
        // aby se tooltip po zavreni modalu nezobrazoval
        // vypada to jako nesystemove reseni, ale jde o domenove reseni diky provazanosti modalu a edit buttonu
        events={{ hover: true, focus: false, touch: false }}>
        <Button
            color="blue"
            size="sm"
            id={`EditButton_${makeIdFromString(content)}_${contentId}`}
            onClick={onClick}
            aria-label={content}
            {...props}>
            <FontAwesomeIcon icon={faPencil} />
        </Button>
    </Tooltip>
)

export default EditButton
