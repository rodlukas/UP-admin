import * as React from "react"
import "./Or.css"

type Props = {
    content: React.ReactNode
}

const Or: React.FunctionComponent<Props> = ({ content }) => (
    <p className="text-secondary Or">
        <span>nebo</span> {content}
    </p>
)

export default Or
