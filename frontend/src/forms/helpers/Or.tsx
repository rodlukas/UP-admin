import * as React from "react"
import "./Or.css"

type Props = {
    /** Jakýkoliv uzel JSX pro zobrazení jakožto alternativní možnost přidání místo volby stávající entity. */
    content: React.ReactNode
}

/** Komponenta pro zobrazení alternativní možnosti přidání klienta místo volby stávajícího. */
const Or: React.FC<Props> = ({ content }) => (
    <p className="text-secondary Or">
        <span>nebo</span> {content}
    </p>
)

export default Or
