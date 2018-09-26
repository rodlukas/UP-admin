import React from "react"
import NoInfo from "./NoInfo"
import {prettyPhone} from "../global/utils"

const Phone = ({phone}) => {
    if (phone && phone !== "")
        return <a href={'tel:+420' + phone}>{prettyPhone(phone)}</a>
    return <NoInfo/>}

export default Phone
