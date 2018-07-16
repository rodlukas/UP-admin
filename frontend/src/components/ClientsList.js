import React from "react"
import ClientName from "./ClientName"
import ComponentsList from "../global/ComponentsList"

const ClientsList = ({clients = {}}) => {
    const clientComponents = clients.map(membership =>
        <ClientName client={membership.client} link key={membership.client.id}/>)
    if(clients.length)
        return <ComponentsList components={clientComponents}/>
    return (
        <span className="text-muted">
            žádní členové
        </span>)
}

export default ClientsList
