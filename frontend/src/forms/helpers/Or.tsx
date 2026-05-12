import { Text } from "@mantine/core"
import * as React from "react"

import * as styles from "./Or.css"

type Props = {
    /** Jakýkoliv uzel JSX pro zobrazení jakožto alternativní možnost přidání místo volby stávající entity. */
    content: React.ReactNode
}

/** Komponenta pro zobrazení alternativní možnosti přidání klienta místo volby stávajícího. */
const Or: React.FC<Props> = ({ content }) => (
    <Text component="p" c="gray.7" className={styles.or}>
        <span>nebo</span> {content}
    </Text>
)

export default Or
