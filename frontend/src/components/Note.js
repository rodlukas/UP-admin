import React from "react"
import NoInfo from "./NoInfo"

const Note = ({note}) => {
    if (note !== "")
        return <span data-qa="client_note">{note}</span>
    return <NoInfo data-qa="client_note"/>}

export default Note
