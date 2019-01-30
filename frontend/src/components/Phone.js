import React from "react"
import NoInfo from "./NoInfo"
import {prettyPhone} from "../global/utils"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faPhone} from "@fortawesome/pro-solid-svg-icons"
import "./Phone.css"

const Phone = ({phone, icon = false}) => {
    if (phone && phone !== "")
        return (
            <a href={'tel:+420' + phone} data-qa="client_phone" className="Phone">
                {icon &&
                <FontAwesomeIcon flip="horizontal" transform="left-5" icon={faPhone} className="align-middle"/>}
                {prettyPhone(phone)}
            </a>)
    return <NoInfo data-qa="client_phone"/>
}

export default Phone
