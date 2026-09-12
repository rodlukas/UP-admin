import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Button, ButtonProps } from "@mantine/core"
import { faPlus } from "@rodlukas/fontawesome-pro-solid-svg-icons"
import classNames from "classnames"
import * as React from "react"

import { ClickableButtonProps } from "../../types/types"

import * as styles from "./buttons.css"

type Props = Omit<ButtonProps, "content"> &
    ClickableButtonProps & {
        /** Text v tlačítku. */
        content: string
        /** Tlačítko je malé (true). */
        small?: boolean
    }

/** Tlačítko pro přidání objektu v aplikaci. */
const AddButton: React.FC<Props> = ({ content, onClick, small = false, className, ...props }) => {
    const mergedClassName = classNames(
        {
            [styles.smallButton]: small,
        },
        className,
    )
    return (
        <Button
            className={mergedClassName}
            onClick={onClick}
            leftSection={<FontAwesomeIcon icon={faPlus} className={styles.btnIcon} />}
            {...props}>
            {content}
        </Button>
    )
}

export default AddButton
