import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { ActionIcon, ActionIconProps, Tooltip } from "@mantine/core"
import { faPencil } from "@rodlukas/fontawesome-pro-solid-svg-icons"
import * as React from "react"

import { ClickableButtonProps } from "../../types/types"

type Props = Omit<ActionIconProps, "content" | "children"> &
    ClickableButtonProps & {
        /** Text v tlačítku. */
        content?: string
    }

/**
 * Tlačítko pro úpravu objektu v aplikaci.
 *
 * `ActionIcon`, ne `Button` s ikonou uvnitř: Mantine pro čtvercová ikonová tlačítka má
 * vlastní komponentu, která řeší poměr stran, velikosti a stavy sama — `Button` se na to
 * musel dorovnávat vlastním CSS.
 */
const EditButton: React.FC<Props> = ({ content = "Upravit", onClick, ...props }) => (
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
            onClick={onClick}
            aria-label={content}
            {...props}>
            <FontAwesomeIcon icon={faPencil} />
        </ActionIcon>
    </Tooltip>
)

export default EditButton
