import React from "react"
import NoInfo from "./NoInfo"

function prettyPhone(phone) {
    return phone.match(/.{3}/g).join(' ')
}

const Phone = ({phone}) => {
    if (phone && phone !== "")
        return <a href={'tel:+420' + phone}>{prettyPhone(phone)}</a>
    return <NoInfo/>}

export default Phone
