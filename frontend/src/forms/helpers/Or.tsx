import * as React from "react"
import "./Or.css"

type Props = {
    content: React.ReactNode
}

/** Komponenta pro zobrazení alternativní možnosti přidání klienta místo volby stávajícího. */
const Or: React.FunctionComponent<Props> = ({ content }) => (
    <p className="text-secondary Or">
        <span>nebo</span> {content}
    </p>
)

export default Or
