import { Text } from "@mantine/core"
import * as React from "react"

import { QA } from "../types/types"

type Props = QA

/** Komponenta pro jednotné zobrazení nevyplněného údaje napříč aplikací. */
const NoInfo: React.FC<Props> = (props) => (
    <Text component="span" c="dimmed" {...props}>
        ---
    </Text>
)

export default NoInfo
