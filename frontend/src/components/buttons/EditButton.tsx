import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { ActionIcon, ActionIconProps, Tooltip } from "@mantine/core"
import { faPencil } from "@rodlukas/fontawesome-pro-solid-svg-icons"
import * as React from "react"

import { makeIdFromString } from "../../global/utils"

type Props = Omit<ActionIconProps, "content" | "children"> & {
    /** Text v tlačítku. */
    content?: string
    /** ID objektu, pro který se zobrazuje tlačítko. */
    contentId: number | string
    onClick?: React.MouseEventHandler<HTMLButtonElement>
}

/**
 * Tlačítko pro úpravu objektu v aplikaci.
 *
 * `ActionIcon`, ne `Button` s ikonou uvnitř: Mantine pro čtvercová ikonová tlačítka má
 * vlastní komponentu, která řeší poměr stran, velikosti a stavy sama — `Button` se na to
 * musel dorovnávat vlastním CSS.
 */
const EditButton: React.FC<Props> = ({ content = "Upravit", onClick, contentId, ...props }) => (
    <Tooltip
        label={content}
        // aby se tooltip po zavreni modalu nezobrazoval
        // vypada to jako nesystemove reseni, ale jde o domenove reseni diky provazanosti modalu a edit buttonu
        events={{ hover: true, focus: false, touch: false }}>
        <ActionIcon
            // tiche ikonove tlacitko: v tabulkach i v diari je jich na obrazovce desitky,
            // syta varianta z nich delala modrou mrizku. `{...props}` se rozprostira
            // az za tim, takze volajici muze variantu prebit.
            variant="subtle"
            color="gray"
            // `md`, ne `lg`: v tabulce s ~400 radky urcuje vysku radku prave ikona
            size="md"
            id={`EditButton_${makeIdFromString(content)}_${contentId}`}
            onClick={onClick}
            aria-label={content}
            {...props}>
            <FontAwesomeIcon icon={faPencil} />
        </ActionIcon>
    </Tooltip>
)

export default EditButton
