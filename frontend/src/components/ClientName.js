import React from "react"
import {Link} from "react-router-dom"
import {getAttrSafe} from "../global/utils"
import APP_URLS from "../urls"

const PlainName = ({client}) =>
    <span data-qa="client_name">
        <span className="font-weight-bold">{getAttrSafe(client.surname)}</span> {getAttrSafe(client.name)}
    </span>

const ClientName = ({client, link = false}) =>
    <span className="clientName">
        {link ?
            <Link to={(APP_URLS.klienti.url + "/" + client.id)}>
                <PlainName client={client}/>
            </Link>
            :
            <PlainName client={client}/>}
    </span>

export default ClientName
