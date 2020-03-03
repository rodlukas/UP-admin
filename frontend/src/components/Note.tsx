import * as React from "react"
import { ClientType } from "../types/models"
import NoInfo from "./NoInfo"

type Props = {
    note: ClientType["note"]
}

const Note: React.FunctionComponent<Props> = ({ note }) => {
    if (note !== "") return <span data-qa="client_note">{note}</span>
    return <NoInfo data-qa="client_note" />
}

export default Note
