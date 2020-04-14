import * as React from "react"
import { GroupType } from "../types/models"
import ComponentsList from "./ComponentsList"
import GroupName from "./GroupName"

type Props = {
    /** Pole se skupinami. */
    groups: Array<GroupType>
}

/** Komponenta zobrazující čárkami oddělený seznam všech skupin, ve kterých je daný klient. */
const GroupsList: React.FC<Props> = ({ groups = [] }) => {
    if (!groups.length) {
        return <span className="text-muted">žádné skupiny</span>
    }
    const groupComponents = groups.map((membership) => (
        <GroupName group={membership} key={membership.id} link showCircle noWrap />
    ))
    return <ComponentsList components={groupComponents} />
}

export default GroupsList
