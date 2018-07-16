import React from "react"
import ClientName from "./ClientName"
import ComponentsList from "../global/ComponentsList"

const ClientsList = ({clients = []}) => {
    if (!clients.length)
        return (
            <span className="text-muted">
                žádní členové
            </span>)
    const clientComponents = clients.map(membership =>
        <ClientName client={membership.client} key={membership.client.id} link/>)
    return <ComponentsList components={clientComponents}/>
}

export default ClientsList
