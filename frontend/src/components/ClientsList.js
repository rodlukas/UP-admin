import React, {Fragment} from "react"
import ClientName from "./ClientName"

const ClientsList = ({clients = {}}) =>
    <Fragment>
        {clients.length ?
            clients.map(membership =>
                <ClientName client={membership.client} link key={membership.client.id}/>
            ).reduce((accu, elem) => {
                return accu === null ? [elem] : [...accu, ', ', elem]
            }, null)
        :
        <span className="text-muted">
            žádní členové
        </span>}
    </Fragment>


export default ClientsList
