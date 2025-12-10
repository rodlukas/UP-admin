import classNames from "classnames"
import * as React from "react"
import { Link } from "react-router-dom"

import APP_URLS from "../APP_URLS"
import { GroupType } from "../types/models"

import ConditionalWrapper from "./ConditionalWrapper"
import CourseCircle from "./CourseCircle"

type InputGroup = GroupType | Pick<GroupType, "name">

type PlainGroupNameProps = {
    /** Skupina nebo alespoň objekt s názvem skupiny. */
    group: InputGroup
    /** Zobraz před názvem skupiny "skupina" (true). */
    title: boolean
    /** Zobraz název skupiny tučně (true). */
    bold: boolean
}

const PlainName: React.FC<PlainGroupNameProps> = ({ group, title, bold }) => (
    <span data-qa="group_name">
        <ConditionalWrapper
            condition={bold}
            wrapper={(children): React.ReactNode => (
                <span className="font-weight-bold">{children}</span>
            )}>
            {title && "Skupina "}
            {group.name}
        </ConditionalWrapper>
    </span>
)

type GroupNameProps = {
    /** Skupina nebo alespoň objekt s názvem skupiny. */
    group: InputGroup
    /** Vytvoř odkaz na kartu skupiny (true). */
    link?: boolean
    /** Zobraz před názvem skupiny "skupina" (true). */
    title?: boolean
    /** Zobraz před názvem skupiny kolečko s barvou kurzu (true). */
    showCircle?: boolean
    /** Zobraz název skupiny tučně (true). */
    bold?: boolean
    /** Nezalamuj název skupiny (true). */
    noWrap?: boolean
}

/** Komponenta pro jednotné zobrazení jména skupiny napříč aplikací. */
const GroupName: React.FC<GroupNameProps> = ({
    group,
    link = false,
    title = false,
    showCircle = false,
    bold = false,
    noWrap = false,
}) => {
    const PlainGroupNameComponent: React.FC = () => (
        <PlainName group={group} title={title} bold={bold} />
    )
    return (
        <span className="ClientName GroupName">
            {"id" in group && link ? (
                <Link to={`${APP_URLS.skupiny.url}/${group.id}`}>
                    <span className={classNames({ "text-nowrap": noWrap })}>
                        {showCircle && <CourseCircle color={group.course.color} size={0.5} />}
                        <PlainGroupNameComponent />
                    </span>
                </Link>
            ) : (
                <PlainGroupNameComponent />
            )}
        </span>
    )
}

export default GroupName
