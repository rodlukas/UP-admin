import React from "react"
import {Link} from "react-router-dom"
import APP_URLS from "../urls"
import Circle from "./Circle"
import "./GroupName.css"

const PlainName = ({group, title}) =>
    <span data-qa="group_name">
        {title && "Skupina "}{group.name}
    </span>

const GroupName = ({group, link = false, title = false, showCircle = false}) =>
    <span className="clientName GroupName">
        {link ?
            <Link to={(APP_URLS.skupiny.url + "/" + group.id)}>
                <span className="text-nowrap">
                    {showCircle &&
                    <Circle color={group.course.color} size={0.5}/>}
                    <PlainName group={group} title={title}/>
                </span>
            </Link>
            :
            <PlainName group={group} title={title}/>}
    </span>

export default GroupName
