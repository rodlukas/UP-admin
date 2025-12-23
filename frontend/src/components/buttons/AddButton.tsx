import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus } from "@rodlukas/fontawesome-pro-solid-svg-icons"
import classNames from "classnames"
import * as React from "react"
import { Button, ButtonProps } from "reactstrap"

import styles from "./buttons.module.css"

type Props = ButtonProps & {
    /** Text v tlačítku. */
    content: string
    /** Tlačítko je malé (true). */
    small?: boolean
}

/** Tlačítko pro přidání objektu v aplikaci. */
const AddButton: React.FC<Props> = ({ content, onClick, small = false, ...props }) => {
    const className = classNames({
        [styles.smallButton]: small,
    })
    return (
        <Button color="info" className={className} onClick={onClick} {...props}>
            <FontAwesomeIcon icon={faPlus} className={styles.btnIcon} />
            {content}
        </Button>
    )
}

export default AddButton
