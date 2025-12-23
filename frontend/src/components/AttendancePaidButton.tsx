import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faUsdCircle } from "@rodlukas/fontawesome-pro-solid-svg-icons"
import classNames from "classnames"
import * as React from "react"

import { usePatchAttendance } from "../api/hooks"

import styles from "./AttendancePaidButton.module.css"
import UncontrolledTooltipWrapper from "./UncontrolledTooltipWrapper"

type Props = {
    /** Lekce je zaplacená (true). */
    paid: boolean
    /** ID účasti. */
    attendanceId: number
}

/** Komponenta zobrazující tlačítko pro platbu klienta za danou lekci. */
const AttendancePaidButton: React.FC<Props> = (props) => {
    const patchAttendance = usePatchAttendance({
        successMessage: "Stav platby za lekci uložen",
    })

    const onClick = React.useCallback((): void => {
        const newPaid = !props.paid
        const id = props.attendanceId
        const data = { id, paid: newPaid }
        patchAttendance.mutate(data)
    }, [props.paid, props.attendanceId, patchAttendance])

    const className = classNames(styles.attendancePaidButton, {
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
