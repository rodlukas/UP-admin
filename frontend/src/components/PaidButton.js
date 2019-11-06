// @flow
import { faUsdCircle } from "@fortawesome/pro-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import React, { Fragment } from "react"
import { UncontrolledTooltip } from "reactstrap"
import AttendanceService from "../api/services/attendance"
import "./PaidButton.css"

type Props = {
    paid: boolean,
    attendanceId: number,
    funcRefresh: () => void
}

const PaidButton = (props: Props) => {
    function onClick() {
        const newPaid = !props.paid
        const id = props.attendanceId
        const data = { id, paid: newPaid }
        AttendanceService.patch(data).then(() => props.funcRefresh())
    }

    const className = "PaidButton " + (props.paid ? "text-success" : "text-danger")
    const title = "Označit lekci jako " + (props.paid ? "NE" : "") + "ZAPLACENOU"
    return (
        <Fragment>
            <FontAwesomeIcon
                icon={faUsdCircle}
                size="2x"
                className={className}
                onClick={onClick}
                data-qa="lecture_attendance_paid"
                id={"PaidButton_" + props.attendanceId}
            />
            <UncontrolledTooltip placement="right" target={"PaidButton_" + props.attendanceId}>
                {title}
            </UncontrolledTooltip>
        </Fragment>
    )
}

export default PaidButton
