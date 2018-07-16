import React from "react"
import NoInfo from "./NoInfo"

const Note = ({note}) => {
    if (note !== "")
        return <span>{note}</span>
    return <NoInfo/>}

export default Note
