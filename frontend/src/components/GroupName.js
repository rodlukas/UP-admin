import React from "react"
import { Link } from "react-router-dom"
import APP_URLS from "../urls"
import Circle from "./Circle"
import ConditionalWrapper from "./ConditionalWrapper"
import "./GroupName.css"

const PlainName = ({ group, title, bold }) => (
    <span data-qa="group_name">
        <ConditionalWrapper
            condition={bold}
            wrapper={children => <span className="font-weight-bold">{children}</span>}>
            {title && "Skupina "}
            {group.name}
        </ConditionalWrapper>
    </span>
)

const GroupName = ({ group, link = false, title = false, showCircle = false, bold = false }) => (
    <span className="clientName GroupName">
        <ConditionalWrapper
            condition={link}
            wrapper={children => (
                <Link to={APP_URLS.skupiny.url + "/" + group.id}>
                    <span className="text-nowrap">
                        {showCircle && <Circle color={group.course.color} size={0.5} />}
                        {children}
                    </span>
                </Link>
            )}>
            <PlainName group={group} title={title} bold={bold} />
        </ConditionalWrapper>
    </span>
)

export default GroupName
