import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faUsdCircle } from "@rodlukas/fontawesome-pro-solid-svg-icons"
import classNames from "classnames"
import * as React from "react"

import { AnalyticsSource, trackEvent } from "../analytics"
import { usePatchAttendance } from "../api/hooks"

import * as styles from "./AttendancePaidButton.css"
import UncontrolledTooltipWrapper from "./UncontrolledTooltipWrapper"

type Props = {
    /** Lekce je zaplacená (true). */
    paid: boolean
    /** ID účasti. */
    attendanceId: number
    /** Identifikace místa, odkud byla akce provedena (pro analytiku). */
    source: AnalyticsSource
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
        patchAttendance.mutate(data, {
            onSuccess: () =>
                trackEvent("attendance_paid_toggled", { source: props.source, paid: newPaid }),
        })
    }, [props.paid, props.attendanceId, props.source, patchAttendance])

    const className = classNames(styles.attendancePaidButton, {
        [styles.attendancePaidButtonSuccess]: props.paid,
        [styles.attendancePaidButtonDanger]: !props.paid,
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
