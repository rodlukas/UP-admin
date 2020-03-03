import * as React from "react"
import { QA } from "../types/types"

type Props = QA

const NoInfo: React.FunctionComponent<Props> = props => (
    <span className="text-muted" {...props}>
        ---
    </span>
)

export default NoInfo
