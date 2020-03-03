import * as React from "react"
import { Link } from "react-router-dom"
import { getAttrSafe } from "../global/utils"
import { ClientType } from "../types/models"
import APP_URLS from "../urls"
import ConditionalWrapper from "./ConditionalWrapper"

type InputClient = ClientType | Pick<ClientType, "firstname" | "surname">

type PlainClientNameProps = {
    client: InputClient
    bold: boolean
}

const PlainClientName: React.FunctionComponent<PlainClientNameProps> = ({ client, bold }) => (
    <span data-qa="client_name" data-gdpr>
        <span className="font-weight-bold">{getAttrSafe(client.surname)}</span>{" "}
        <ConditionalWrapper
            condition={bold}
            wrapper={(children): React.ReactNode => (
                <span className="font-weight-bold">{children}</span>
            )}>
            {getAttrSafe(client.firstname)}
        </ConditionalWrapper>
    </span>
)

type ClientNameProps = {
    client: InputClient
    link?: boolean
    bold?: boolean
}

const ClientName: React.FunctionComponent<ClientNameProps> = ({
    client,
    link = false,
    bold = false
}) => {
    const PlainClientNameComponent: React.FunctionComponent = () => (
        <PlainClientName client={client} bold={bold} />
    )
    return (
        <span className="clientName">
            {"id" in client && link ? (
                <Link to={APP_URLS.klienti.url + "/" + client.id}>
                    <PlainClientNameComponent />
                </Link>
            ) : (
                <PlainClientNameComponent />
            )}
        </span>
    )
}

export default ClientName
