import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Tooltip } from "@mantine/core"
import { faCommentAltDollar } from "@rodlukas/fontawesome-pro-solid-svg-icons"
import * as React from "react"

import { iconWarning } from "../global/utility.css"
import { AttendanceType } from "../types/models"

type Props = {
    /** Účast klienta na lekci. */
    attendance: AttendanceType
}

/** Komponenta zobrazující upozornění na fakt, že klient už bude muset příště platit za další lekce. */
const AttendanceRemindPay: React.FC<Props> = ({ attendance }) => {
    if (!attendance.remind_pay) {
        return null
    }
    return (
        <Tooltip label="Příště platit">
            <span>
                <FontAwesomeIcon
                    icon={faCommentAltDollar}
                    size="lg"
                    className={iconWarning}
                    transform="up-4"
                />
            </span>
        </Tooltip>
    )
}

export default AttendanceRemindPay
