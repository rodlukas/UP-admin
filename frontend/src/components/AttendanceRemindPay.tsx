import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Tooltip } from "@mantine/core"
import { faExclamationCircle } from "@rodlukas/fontawesome-pro-solid-svg-icons"
import * as React from "react"

import { iconWarning } from "../global/utility.css"
import { AttendanceType } from "../types/models"

import { attendanceIconSlot } from "./Attendances.css"

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
            {/* stejný slot i velikost jako ikona platby — bez `transform`, který ikonu
                dřív zvedal nad účaří a rozhazoval řádek */}
            <span className={attendanceIconSlot}>
                <FontAwesomeIcon icon={faExclamationCircle} size="lg" className={iconWarning} />
            </span>
        </Tooltip>
    )
}

export default AttendanceRemindPay
