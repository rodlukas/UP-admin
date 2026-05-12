import { Badge } from "@mantine/core"
import classNames from "classnames"
import * as React from "react"

import { AnalyticsSource } from "../analytics"
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
    /** Identifikace místa, odkud je komponenta použita (pro analytiku). */
    source: AnalyticsSource
}

/** Komponenta zobrazující jednotlivou účast klienta na dané lekci. */
const Attendance: React.FC<AttendanceProps> = ({ attendance, showClient = false, source }) => (
    <li data-qa="lecture_attendance">
        {showClient && <ClientName client={attendance.client} link className={styles.clientName} />}{" "}
        <AttendancePaidButton paid={attendance.paid} attendanceId={attendance.id} source={source} />{" "}
        {attendance.number && (
            <>
                <Badge
                    variant="default"
                    radius="xl"
                    fw="bold"
                    className={classNames(styles.attendanceNumber)}>
                    {attendance.number}
                </Badge>{" "}
            </>
        )}
        <AttendanceRemindPay attendance={attendance} />
        <LectureNote attendance={attendance} />
        <div className={styles.attendanceStateWrapper}>
            <AttendanceSelectAttendanceState
                value={attendance.attendancestate}
                attendanceId={attendance.id}
                source={source}
            />
        </div>
    </li>
)

type AttendancesProps = {
    /** Lekce, jejíž účasti se zobrazí. */
    lecture: LectureType
    /** Zobraz jméno klienta (true). */
    showClient?: boolean
    /** Identifikace místa, odkud je komponenta použita (pro analytiku). */
    source: AnalyticsSource
}

/** Komponenta zobrazující účasti všech klientů na dané lekci. */
const Attendances: React.FC<AttendancesProps> = ({ lecture, showClient = false, source }) => {
    const className = classNames(styles.attendances, {
        [styles.attendancesGroup]: lecture.group,
    })
    return (
        <ul className={className}>
            {lecture.attendances.map((attendance) => (
                <Attendance attendance={attendance} key={attendance.id} showClient={showClient} source={source} />
            ))}
        </ul>
    )
}

export default Attendances
