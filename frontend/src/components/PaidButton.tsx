import { faUsdCircle } from "@fortawesome/pro-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import * as React from "react"
import AttendanceService from "../api/services/attendance"
import "./PaidButton.css"
import UncontrolledTooltipWrapper from "./UncontrolledTooltipWrapper"

type Props = {
    paid: boolean
    attendanceId: number
    funcRefresh: () => void
}

const PaidButton: React.FunctionComponent<Props> = props => {
    function onClick(): void {
        const newPaid = !props.paid
        const id = props.attendanceId
        const data = { id, paid: newPaid }
        AttendanceService.patch(data).then(() => props.funcRefresh())
    }

    const className = "PaidButton " + (props.paid ? "text-success" : "text-danger")
    const title = "Označit lekci jako " + (props.paid ? "NE" : "") + "ZAPLACENOU"
    return (
        <>
            <span id={"PaidButton_" + props.attendanceId}>
                <FontAwesomeIcon
                    icon={faUsdCircle}
                    size="2x"
                    className={className}
                    onClick={onClick}
                    data-qa="lecture_attendance_paid"
                />
            </span>
            <UncontrolledTooltipWrapper
                placement="right"
                target={"PaidButton_" + props.attendanceId}>
                {title}
            </UncontrolledTooltipWrapper>
        </>
    )
}

export default PaidButton
