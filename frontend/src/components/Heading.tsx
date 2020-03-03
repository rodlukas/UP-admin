import * as React from "react"
import "./Heading.css"

type Props = {
    content: React.ReactNode
}

/** Komponenta pro jednotné zobrazení nadpisu stránky napříč aplikací. */
const Heading: React.FC<Props> = ({ content }) => (
    <h1 className="text-center mb-4 Heading mt-2">{content}</h1>
)

export default Heading
