import React from "react"
import {Link} from "react-router-dom"
import APP_URLS from "../urls"

const PlainName = ({group, title}) =>
    <span data-qa="group_name">
        {title && "Skupina "}{group.name}
    </span>

const GroupName = ({group, link = false, title = false}) =>
    <span className="clientName">
        {link ?
            <Link to={(APP_URLS.skupiny.url + "/" + group.id)}>
                <PlainName group={group} title={title}/>
            </Link>
            :
            <PlainName group={group} title={title}/>}
    </span>

export default GroupName
