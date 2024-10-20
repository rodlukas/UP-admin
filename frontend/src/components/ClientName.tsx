import * as React from "react"
import { Link } from "react-router-dom"

import APP_URLS from "../APP_URLS"
import { ClientType } from "../types/models"

import "./ClientName.css"
import ConditionalWrapper from "./ConditionalWrapper"

type InputClient = ClientType | Pick<ClientType, "firstname" | "surname">

type PlainClientNameProps = {
    /** Klient nebo alespoň objekt s křestním jménem a příjmením. */
    client: InputClient
    /** Zobraz jméno klienta tučně (true). */
    bold: boolean
}

const PlainClientName: React.FC<PlainClientNameProps> = ({ client, bold }) => (
    <span data-qa="client_name" data-gdpr>
        <span className="fw-bold">{client.surname}</span>{" "}
        <ConditionalWrapper
            condition={bold}
            wrapper={(children): React.ReactNode => <span className="fw-bold">{children}</span>}>
            {client.firstname}
        </ConditionalWrapper>
    </span>
)

type ClientNameProps = {
    /** Klient nebo alespoň objekt s křestním jménem a příjmením. */
    client: InputClient
    /** Vytvoř odkaz na kartu klienta (true). */
    link?: boolean
    /** Zobraz jméno klienta tučně (true). */
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
