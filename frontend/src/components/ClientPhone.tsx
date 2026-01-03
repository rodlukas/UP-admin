import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPhone } from "@rodlukas/fontawesome-pro-solid-svg-icons"
import * as React from "react"

import { prettyPhone } from "../global/utils"
import { ClientType } from "../types/models"

import * as styles from "./ClientPhone.css"
import NoInfo from "./NoInfo"

type Props = {
    /** Telefonní číslo klienta. */
    phone: ClientType["phone"]
    /** Zobraz ikonu u telefonního čísla (true). */
    icon?: boolean
}

/** Komponenta pro jednotné zobrazení telefonního čísla klienta napříč aplikací. */
const ClientPhone: React.FC<Props> = ({ phone, icon = false }) => {
    if (phone !== "") {
        return (
            <a
                href={`tel:+420${phone}`}
                data-qa="client_phone"
                className={styles.clientPhone}
                data-gdpr>
                {icon && (
                    <FontAwesomeIcon
                        flip="horizontal"
                        icon={faPhone}
                        className="align-middle me-1"
                    />
                )}
                {prettyPhone(phone)}
            </a>
        )
    }
    return <NoInfo data-qa="client_phone" />
}

export default ClientPhone
