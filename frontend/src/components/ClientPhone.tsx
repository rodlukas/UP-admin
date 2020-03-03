import { faPhone } from "@fortawesome/pro-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import * as React from "react"
import { prettyPhone } from "../global/utils"
import { ClientType } from "../types/models"
import "./ClientPhone.css"
import NoInfo from "./NoInfo"

type Props = {
    phone: ClientType["phone"]
    icon?: boolean
}

/** Komponenta pro jednotné zobrazení telefonního čísla klienta napříč aplikací. */
const ClientPhone: React.FC<Props> = ({ phone, icon = false }) => {
    if (phone && phone !== "")
        return (
            <a href={"tel:+420" + phone} data-qa="client_phone" className="ClientPhone" data-gdpr>
                {icon && (
                    <FontAwesomeIcon
                        flip="horizontal"
                        transform="left-5"
                        icon={faPhone}
                        className="align-middle"
                    />
                )}
                {prettyPhone(phone)}
            </a>
        )
    return <NoInfo data-qa="client_phone" />
}

export default ClientPhone
