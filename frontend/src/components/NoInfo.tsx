import * as React from "react"
import { QA } from "../types/types"

type Props = QA

/** Komponenta pro jednotné zobrazení nevyplněného údaje napříč aplikací. */
const NoInfo: React.FC<Props> = (props) => (
    <span className="text-muted" {...props}>
        ---
    </span>
)

export default NoInfo
