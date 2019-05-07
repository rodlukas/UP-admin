import React from "react"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faUsdCircle} from "@fortawesome/pro-solid-svg-icons"
import "./PaidButton.css"
import AttendanceService from "../api/services/attendance"

const PaidButton = props => {
    function onClick() {
        const newPaid = !props.paid
        const id = props.attendanceId
        const data = {id, paid: newPaid}
        AttendanceService.patch(data)
            .then(() => props.funcRefresh())
    }

    const className = "PaidButton " + (props.paid ? "text-success" : "text-danger")
    return (
        <FontAwesomeIcon icon={faUsdCircle} size="2x"
                         className={className}
                         onClick={onClick} data-qa="lecture_attendance_paid"/>
    )
}

export default PaidButton
