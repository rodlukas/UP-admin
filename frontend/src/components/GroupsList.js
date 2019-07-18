import React from "react"
import ComponentsList from "./ComponentsList"
import GroupName from "./GroupName"

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
