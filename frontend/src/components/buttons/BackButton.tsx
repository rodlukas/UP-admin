import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Button, ButtonProps } from "@mantine/core"
import { faArrowLeft } from "@rodlukas/fontawesome-pro-solid-svg-icons"
import * as React from "react"

import * as styles from "./buttons.css"

type Props = Omit<ButtonProps, "content"> & {
    /** Text v tlačítku. */
    content?: string
    onClick?: React.MouseEventHandler<HTMLButtonElement>
}

/** Tlačítko pro krok zpět v aplikaci. */
const BackButton: React.FC<Props> = ({ onClick, content = "Jít zpět", ...props }) => (
    // ...props až za výchozími hodnotami — typ slibuje průchod ButtonProps, takže caller
    // musí umět přebít variant/color a předat disabled, data-* apod.
    <Button
        variant="filled"
        color="gray"
        onClick={onClick}
        leftSection={<FontAwesomeIcon icon={faArrowLeft} className={styles.btnIcon} />}
        {...props}>
        {content}
    </Button>
)

export default BackButton
