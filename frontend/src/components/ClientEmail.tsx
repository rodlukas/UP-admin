import * as React from "react"
import { ClientType } from "../types/models"
import NoInfo from "./NoInfo"

type Props = {
    /** Email klienta. */
    email: ClientType["email"]
}

/** Komponenta pro jednotné zobrazení e-mailu klienta napříč aplikací. */
const ClientEmail: React.FC<Props> = ({ email }) => {
    if (email !== "") {
        return (
            <a href={`mailto:${email}`} data-qa="client_email" data-gdpr>
                {email}
            </a>
        )
    }
    return <NoInfo data-qa="client_email" />
}

export default ClientEmail
