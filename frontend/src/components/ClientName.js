import React from "react"
import {Link} from "react-router-dom"
import APP_URLS from "../urls"
import {clientName} from "../global/utils"

const PlainName = ({client}) =>
    <span data-qa="client_name">
        {clientName(client)}
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
