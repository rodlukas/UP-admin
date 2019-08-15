import React from "react"
import { Link } from "react-router-dom"
import { getAttrSafe } from "../global/utils"
import APP_URLS from "../urls"
import ConditionalWrapper from "./ConditionalWrapper"

const PlainName = ({ client, bold }) => (
    <span data-qa="client_name" data-gdpr>
        <span className="font-weight-bold">{getAttrSafe(client.surname)}</span>{" "}
        <ConditionalWrapper
            condition={bold}
            wrapper={children => <span className="font-weight-bold">{children}</span>}>
            {getAttrSafe(client.name)}
        </ConditionalWrapper>
    </span>
)

const ClientName = ({ client, link = false, bold = false }) => (
    <span className="clientName">
        <ConditionalWrapper
            condition={link}
            wrapper={children => (
                <Link to={APP_URLS.klienti.url + "/" + client.id}>{children}</Link>
            )}>
            <PlainName client={client} bold={bold} />
        </ConditionalWrapper>
    </span>
)

export default ClientName
