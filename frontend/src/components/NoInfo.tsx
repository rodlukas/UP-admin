import { Text } from "@mantine/core"
import * as React from "react"

import { QA } from "../types/types"

type Props = QA

/**
 * Komponenta pro jednotné zobrazení nevyplněného údaje napříč aplikací.
 *
 * Pomlčka, ne tři spojovníky: `---` je zvyk z terminálu, v tabulce se opakuje třikrát
 * na řádek a dělá šum. Znak musí zůstat v synchronu s `frontend_empty_str`
 * v tests/ui_steps/helpers.py, který proti němu porovnává prázdnou hodnotu.
 */
const NoInfo: React.FC<Props> = (props) => (
    <Text component="span" c="dimmed" {...props}>
        —
    </Text>
)

export default NoInfo
