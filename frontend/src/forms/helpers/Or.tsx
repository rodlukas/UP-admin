import classNames from "classnames"
import * as React from "react"

import styles from "./Or.module.css"

type Props = {
    /** Jakýkoliv uzel JSX pro zobrazení jakožto alternativní možnost přidání místo volby stávající entity. */
    content: React.ReactNode
}

/** Komponenta pro zobrazení alternativní možnosti přidání klienta místo volby stávajícího. */
const Or: React.FC<Props> = ({ content }) => (
    <p className={classNames("text-secondary", styles.or)}>
        <span>nebo</span> {content}
    </p>
)

export default Or
