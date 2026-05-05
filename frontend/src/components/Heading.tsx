import { Group, Loader, Title } from "@mantine/core"
import * as React from "react"

import * as styles from "./Heading.css"

type Props = {
    /** Jakýkoliv uzel JSX tvořící nadpis. */
    title: React.ReactNode
    /** Jakýkoliv uzel JSX tvořící tlačítka. */
    buttons?: React.ReactNode
    /** Indikátor nadpisu v kontejneru fluid (pro jiné zarovnání). */
    fluid?: boolean
    /** Probíhá načítání dat na pozadí (true) - zobrazí spinner v nadpisu. */
    isFetching?: boolean
}

/** Komponenta pro jednotné zobrazení nadpisu stránky napříč aplikací. */
const Heading: React.FC<Props> = ({ title, buttons, fluid = false, isFetching = false }) => (
    <Group
        justify={fluid ? "center" : "space-between"}
        align="center"
        mt="md"
        mb="lg"
        gap="sm"
        className={buttons ? undefined : styles.headingWithoutButtons}>
        <Title order={1} className={styles.headingTitle}>
            {title}
            {isFetching && (
                <Loader
                    size="xs"
                    type="dots"
                    color="gray"
                    style={{ marginLeft: "0.5rem", verticalAlign: "middle" }}
                    data-qa="loading"
                />
            )}
        </Title>
        {buttons ? <div className={styles.headingButtons}>{buttons}</div> : null}
    </Group>
)

export default Heading
