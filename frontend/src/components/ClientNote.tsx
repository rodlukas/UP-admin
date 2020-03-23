import * as React from "react"
import { ClientType } from "../types/models"
import NoInfo from "./NoInfo"

type Props = {
    note: ClientType["note"]
}

/** Komponenta pro jednotné zobrazení poznámky ke klientovi napříč aplikací. */
const ClientNote: React.FC<Props> = ({ note }) => {
    if (note !== "") {
        return <span data-qa="client_note">{note}</span>
    }
    return <NoInfo data-qa="client_note" />
}

export default ClientNote
