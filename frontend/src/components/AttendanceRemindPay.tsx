import { faCommentAltDollar } from "@fortawesome/pro-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import * as React from "react"
import { AttendanceType } from "../types/models"
import UncontrolledTooltipWrapper from "./UncontrolledTooltipWrapper"

type Props = {
    attendance: AttendanceType
}

/** Komponenta zobrazující upozornění na fakt, že klient už bude muset příště platit za další lekce. */
const AttendanceRemindPay: React.FC<Props> = ({ attendance }) => {
    if (!attendance.remind_pay) {
        return null
    }
    return (
        <>
            <FontAwesomeIcon
                id={`RemindPay_${attendance.id}`}
                icon={faCommentAltDollar}
                size="lg"
                className="text-secondary"
                transform="up-4"
            />
            <UncontrolledTooltipWrapper target={`RemindPay_${attendance.id}`}>
                Příště platit
            </UncontrolledTooltipWrapper>
        </>
    )
}

export default AttendanceRemindPay
