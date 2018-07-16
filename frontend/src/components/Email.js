import React from "react"
import NoInfo from "./NoInfo"

const Email = ({email}) => {
    if (email !== "")
        return <a href={'mailto:' + email}>{email}</a>
    return <NoInfo/>}

export default Email
