import { Group, Title } from "@mantine/core"
import * as React from "react"

import * as styles from "./Heading.css"

type Props = {
    /** Jakýkoliv uzel JSX tvořící nadpis. */
    title: React.ReactNode
    /** Jakýkoliv uzel JSX tvořící tlačítka. */
    buttons?: React.ReactNode
    /** HTML úroveň nadpisu (h1–h6). Defaultně 1; používej 2 u sekundárních sekcí. */
    order?: 1 | 2 | 3 | 4 | 5 | 6
    /**
     * Vizuální velikost nezávislá na sémantické úrovni (`order`) — např. hlavní nadpis
     * stránky (h1), který má vypadat jako h2, aby ladil se sousedními sekcemi.
     */
    size?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
}

/** Komponenta pro jednotné zobrazení nadpisu stránky napříč aplikací. */
const Heading: React.FC<Props> = ({ title, buttons, order = 1, size }) => (
    <Group
        justify="space-between"
        align="center"
        mt="md"
        mb="lg"
        gap="sm"
        className={buttons ? undefined : styles.headingWithoutButtons}>
        <Title order={order} size={size} className={styles.headingTitle}>
            {title}
        </Title>
        {buttons ? <div className={styles.headingButtons}>{buttons}</div> : null}
    </Group>
)

export default Heading
