import React from "react"
import {Link} from "react-router-dom"
import APP_URLS from "../urls"

const PlainName = ({client}) =>
    <span data-qa="client_name">
        {client.surname} {client.name}
    </span>

const ClientName = ({client, link = false}) =>
    <span className="clientName">
        {link ?
            <Link to={(APP_URLS.klienti + "/" + client.id)}>
                <PlainName client={client}/>
            </Link>
            :
            <PlainName client={client}/>}
    </span>

export default ClientName
