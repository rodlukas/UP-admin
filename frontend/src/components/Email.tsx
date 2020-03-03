import * as React from "react"
import { ClientType } from "../types/models"
import NoInfo from "./NoInfo"

type Props = {
    email: ClientType["email"]
}

const Email: React.FunctionComponent<Props> = ({ email }) => {
    if (email !== "")
        return (
            <a href={"mailto:" + email} data-qa="client_email" data-gdpr>
                {email}
            </a>
        )
    return <NoInfo data-qa="client_email" />
}

export default Email
