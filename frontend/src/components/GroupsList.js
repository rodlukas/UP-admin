import React from "react"
import GroupName from "./GroupName"
import ComponentsList from "./ComponentsList"

const GroupsList = ({groups = []}) => {
    if (!groups.length)
        return (
            <span className="text-muted">
                žádné skupiny
            </span>)
    const groupComponents = groups.map(membership =>
        <GroupName group={membership} key={membership.id} link/>)
    return <ComponentsList components={groupComponents}/>
}

export default GroupsList
