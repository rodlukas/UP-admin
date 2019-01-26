import React, {Fragment} from "react"
import NoInfo from "./NoInfo"
import {prettyPhone} from "../global/utils"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faPhone} from "@fortawesome/pro-solid-svg-icons"

const Phone = ({phone, icon = false}) => {
    if (phone && phone !== "")
        return (
            <a href={'tel:+420' + phone} data-qa="client_phone">
                {icon &&
                <Fragment>
                    <FontAwesomeIcon flip="horizontal" icon={faPhone}/>
                    {' '}
                </Fragment>
                }
                {prettyPhone(phone)}
            </a>)
    return <NoInfo data-qa="client_phone"/>
}

export default Phone
