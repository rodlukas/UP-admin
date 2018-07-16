import React from "react"
import NoInfo from "./NoInfo"

const Phone = ({phone}) => {
    if (phone !== "")
        return <a href={'tel:' + phone}>{phone}</a>
    return <NoInfo/>}

export default Phone
