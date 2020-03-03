import { faUsdCircle } from "@fortawesome/pro-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import * as React from "react"
import AttendanceService from "../api/services/attendance"
import "./AttendancePaidButton.css"
import UncontrolledTooltipWrapper from "./UncontrolledTooltipWrapper"

type Props = {
    paid: boolean
    attendanceId: number
    funcRefresh: () => void
}

/** Komponenta zobrazující tlačítko pro platbu klienta za danou lekci. */
const AttendancePaidButton: React.FC<Props> = props => {
    function onClick(): void {
        const newPaid = !props.paid
        const id = props.attendanceId
        const data = { id, paid: newPaid }
        AttendanceService.patch(data).then(() => props.funcRefresh())
    }

    const className = "AttendancePaidButton " + (props.paid ? "text-success" : "text-danger")
    const title = "Označit lekci jako " + (props.paid ? "NE" : "") + "ZAPLACENOU"
    return (
        <>
            <span id={"AttendancePaidButton_" + props.attendanceId}>
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
                target={"AttendancePaidButton_" + props.attendanceId}>
                {title}
            </UncontrolledTooltipWrapper>
        </>
    )
}

export default AttendancePaidButton
