import * as React from "react"
import { Link } from "react-router-dom"
import APP_URLS from "../APP_URLS"
import { ClientType } from "../types/models"
import "./ClientName.css"
import ConditionalWrapper from "./ConditionalWrapper"

type InputClient = ClientType | Pick<ClientType, "firstname" | "surname">

type PlainClientNameProps = {
    client: InputClient
    bold: boolean
}

const PlainClientName: React.FC<PlainClientNameProps> = ({ client, bold }) => (
    <span data-qa="client_name" data-gdpr>
        <span className="font-weight-bold">{client.surname}</span>{" "}
        <ConditionalWrapper
            condition={bold}
            wrapper={(children): React.ReactNode => (
                <span className="font-weight-bold">{children}</span>
            )}>
            {client.firstname}
        </ConditionalWrapper>
    </span>
)

type ClientNameProps = {
    client: InputClient
    link?: boolean
    bold?: boolean
}

/** Komponenta pro jednotné zobrazení jména klienta napříč aplikací. */
const ClientName: React.FC<ClientNameProps> = ({ client, link = false, bold = false }) => {
    const PlainClientNameComponent: React.FC = () => <PlainClientName client={client} bold={bold} />
    return (
        <span className="ClientName">
            {"id" in client && link ? (
                <Link to={`${APP_URLS.klienti.url}/${client.id}`}>
                    <PlainClientNameComponent />
                </Link>
            ) : (
                <PlainClientNameComponent />
            )}
        </span>
    )
}

export default ClientName
