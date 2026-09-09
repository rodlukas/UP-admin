import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { ActionIcon, ActionIconProps, Tooltip } from "@mantine/core"
import { faTrash } from "@rodlukas/fontawesome-pro-solid-svg-icons"
import * as React from "react"

import * as styles from "./DeleteIconButton.css"

type Props = Omit<ActionIconProps, "content" | "children"> & {
    /** Co se maže — doplní se do tooltipu a přístupného názvu. */
    content: string
    onClick?: React.MouseEventHandler<HTMLButtonElement>
}

/**
 * Ikonové tlačítko pro smazání položky ze seznamu.
 *
 * Proti `DeleteButton` (popisek „Smazat", světle červená výplň) je určené na řádky, kde se
 * opakuje: jako výplňové tlačítko byla destruktivní akce nejvýraznější věcí řádku. Zůstává
 * proto `subtle`, tedy bez plochy — ale **glyf je červený od začátku**, ne až na hover.
 * Barva je tu nosič významu (maže se), ne zvýraznění: šedá popelnice vypadá stejně jako
 * tužka vedle ní a rozdíl mezi „upravit" a „smazat" se pozná až po najetí.
 *
 * `DeleteButton` zůstává pro danger zóny formulářů, kde popisek smysl má.
 */
const DeleteIconButton: React.FC<Props> = ({ onClick, content, ...props }) => {
    const label = `Smazat ${content}`
    return (
        <Tooltip label={label}>
            <ActionIcon
                variant="subtle"
                color="red"
                // `md`, ne `lg`: v tabulce s ~400 radky urcuje vysku radku prave ikona
                size="md"
                onClick={onClick}
                aria-label={label}
                {...props}>
                <FontAwesomeIcon icon={faTrash} className={styles.deleteIcon} />
            </ActionIcon>
        </Tooltip>
    )
}

export default DeleteIconButton
