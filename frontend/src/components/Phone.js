import React from "react"
import NoInfo from "./NoInfo"
import {prettyPhone} from "../global/utils"

const Phone = ({phone}) => {
    if (phone && phone !== "")
        return <a href={'tel:+420' + phone} data-qa="client_phone">{prettyPhone(phone)}</a>
    return <NoInfo data-qa="client_phone"/>}

export default Phone
