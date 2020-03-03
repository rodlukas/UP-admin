import * as React from "react"
import { Link } from "react-router-dom"
import { GroupType } from "../types/models"
import APP_URLS from "../urls"
import Circle from "./Circle"
import ConditionalWrapper from "./ConditionalWrapper"
import "./GroupName.css"

type InputGroup = GroupType | Pick<GroupType, "name">

type PlainGroupNameProps = {
    group: InputGroup
    title: boolean
    bold: boolean
}

const PlainName: React.FunctionComponent<PlainGroupNameProps> = ({ group, title, bold }) => (
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
    group: InputGroup
    link?: boolean
    title?: boolean
    showCircle?: boolean
    bold?: boolean
    noWrap?: boolean
}

const GroupName: React.FunctionComponent<GroupNameProps> = ({
    group,
    link = false,
    title = false,
    showCircle = false,
    bold = false,
    noWrap = false
}) => {
    const PlainGroupNameComponent: React.FunctionComponent = () => (
        <PlainName group={group} title={title} bold={bold} />
    )
    return (
        <span className="clientName GroupName">
            {"id" in group && link ? (
                <Link to={APP_URLS.skupiny.url + "/" + group.id}>
                    <span className={noWrap ? "text-nowrap" : undefined}>
                        {showCircle && <Circle color={group.course.color} size={0.5} />}
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
