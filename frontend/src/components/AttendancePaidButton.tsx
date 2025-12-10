import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faUsdCircle } from "@rodlukas/fontawesome-pro-solid-svg-icons"
import classNames from "classnames"
import * as React from "react"

import AttendanceService from "../api/services/AttendanceService"

import "./AttendancePaidButton.css"
import UncontrolledTooltipWrapper from "./UncontrolledTooltipWrapper"

type Props = {
    /** Lekce je zaplacená (true). */
    paid: boolean
    /** ID účasti. */
    attendanceId: number
    /** Funkce, která se zavolá po aktualizaci platby za lekci. */
    funcRefresh: () => void
}

/** Komponenta zobrazující tlačítko pro platbu klienta za danou lekci. */
const AttendancePaidButton: React.FC<Props> = (props) => {
    function onClick(): void {
        const newPaid = !props.paid
        const id = props.attendanceId
        const data = { id, paid: newPaid }
        AttendanceService.patch(data).then(() => props.funcRefresh())
    }

    const className = classNames("AttendancePaidButton", {
        "text-success": props.paid,
        "text-danger": !props.paid,
    })
    const title = `Označit lekci jako ${props.paid ? "NE" : ""}ZAPLACENOU`
    return (
        <>
            <FontAwesomeIcon
                id={`AttendancePaidButton_${props.attendanceId}`}
                icon={faUsdCircle}
                size="2x"
                className={className}
                onClick={onClick}
                data-qa="lecture_attendance_paid"
            />
            <UncontrolledTooltipWrapper
                placement="right"
                target={`AttendancePaidButton_${props.attendanceId}`}>
                {title}
            </UncontrolledTooltipWrapper>
        </>
    )
}

export default AttendancePaidButton
