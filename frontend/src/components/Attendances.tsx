import classNames from "classnames"
import * as React from "react"
import { Badge } from "reactstrap"

import { AttendanceType, LectureType } from "../types/models"

import AttendancePaidButton from "./AttendancePaidButton"
import AttendanceRemindPay from "./AttendanceRemindPay"
import * as styles from "./Attendances.css"
import AttendanceSelectAttendanceState from "./AttendanceSelectAttendanceState"
import ClientName from "./ClientName"
import LectureNote from "./LectureNote"

type AttendanceProps = {
    /** Účast klienta na lekci. */
    attendance: AttendanceType
    /** Zobraz jméno klienta (true). */
    showClient: boolean
}

/** Komponenta zobrazující jednotlivou účast klienta na dané lekci. */
const Attendance: React.FC<AttendanceProps> = ({ attendance, showClient = false }) => (
    <li data-qa="lecture_attendance">
        {showClient && <ClientName client={attendance.client} link className={styles.clientName} />}{" "}
        <AttendancePaidButton paid={attendance.paid} attendanceId={attendance.id} />{" "}
        {attendance.number && (
            <>
                <Badge
                    color="secondary"
                    pill
                    className={classNames(styles.attendanceNumber, "fw-bold")}>
                    {attendance.number}
                </Badge>{" "}
            </>
        )}
        <AttendanceRemindPay attendance={attendance} /> <LectureNote attendance={attendance} />
        <AttendanceSelectAttendanceState
            value={attendance.attendancestate}
            attendanceId={attendance.id}
        />
    </li>
)

type AttendancesProps = {
    /** Lekce, jejíž účasti se zobrazí. */
    lecture: LectureType
    /** Zobraz jméno klienta (true). */
    showClient?: boolean
}

/** Komponenta zobrazující účasti všech klientů na dané lekci. */
const Attendances: React.FC<AttendancesProps> = ({ lecture, showClient = false }) => {
    const className = classNames(styles.attendances, {
        [styles.attendancesGroup]: lecture.group,
    })
    return (
        <ul className={className}>
            {lecture.attendances.map((attendance) => (
                <Attendance attendance={attendance} key={attendance.id} showClient={showClient} />
            ))}
        </ul>
    )
}

export default Attendances
