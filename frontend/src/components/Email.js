import React from "react"
import NoInfo from "./NoInfo"

const Email = ({ email }) => {
    if (email !== "")
        return (
            <a href={"mailto:" + email} data-qa="client_email" data-gdpr>
                {email}
            </a>
        )
    return <NoInfo data-qa="client_email" />
}

export default Email
