import React from "react"
import GroupName from "./GroupName"
import ComponentsList from "../global/ComponentsList"

const ClientsList = ({groups = {}}) => {
    const clientComponents = groups.map(membership =>
        <GroupName group={membership} key={membership.id} link/>)
    if (groups.length)
        return <ComponentsList components={clientComponents}/>
    return (
        <span className="text-muted">
            žádné skupiny
        </span>)
}

export default ClientsList
