import { faCommentAltDollar } from "@fortawesome/pro-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import * as React from "react"
import { AttendanceType } from "../types/models"
import UncontrolledTooltipWrapper from "./UncontrolledTooltipWrapper"

type Props = {
    attendance: AttendanceType
}

const RemindPay: React.FunctionComponent<Props> = ({ attendance }) => {
    if (!attendance.remind_pay) return null
    return (
        <>
            <span id={"RemindPay_" + attendance.id}>
                <FontAwesomeIcon
                    icon={faCommentAltDollar}
                    size="lg"
                    className="text-secondary"
                    transform="up-4"
                />
            </span>
            <UncontrolledTooltipWrapper target={"RemindPay_" + attendance.id}>
                Příště platit
            </UncontrolledTooltipWrapper>
        </>
    )
}

export default RemindPay
