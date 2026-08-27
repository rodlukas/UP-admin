import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Tooltip } from "@mantine/core"
import { faUsdCircle } from "@rodlukas/fontawesome-pro-solid-svg-icons"
import classNames from "classnames"
import * as React from "react"

import { AnalyticsSource, trackEvent } from "../analytics"
import { usePatchAttendance } from "../api/hooks"

import * as styles from "./AttendancePaidButton.css"

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

    const isPending = patchAttendance.isPending

    const onClick = React.useCallback((): void => {
        if (isPending) {
            return
        }
        const newPaid = !props.paid
        const id = props.attendanceId
        const data = { id, paid: newPaid }
        patchAttendance.mutate(data, {
            onSuccess: () =>
                trackEvent("attendance_paid_toggled", { source: props.source, paid: newPaid }),
        })
    }, [isPending, props.paid, props.attendanceId, props.source, patchAttendance])

    const className = classNames(styles.attendancePaidButton, {
        [styles.attendancePaidButtonSuccess]: props.paid,
        [styles.attendancePaidButtonDanger]: !props.paid,
    })
    const title = `Označit lekci jako ${props.paid ? "NE" : ""}ZAPLACENOU`
    // focus: obsah tooltipu musí být dosažitelný i z klávesnice (WCAG 1.4.13)
    return (
        <Tooltip label={title} position="right" events={{ hover: true, focus: true, touch: true }}>
            {/* nativní <button>: aktivaci klávesnicí, focus i sémantiku řeší prohlížeč
                (aria-disabled místo `disabled`, aby tooltip zůstal dosažitelný i během ukládání) */}
            <button
                type="button"
                aria-label={title}
                aria-busy={isPending}
                aria-disabled={isPending}
                className={styles.buttonWrap}
                onClick={onClick}>
                <FontAwesomeIcon
                    icon={faUsdCircle}
                    size="2x"
                    className={className}
                    data-qa="lecture_attendance_paid"
                    data-paid={props.paid}
                />
            </button>
        </Tooltip>
    )
}

export default AttendancePaidButton
