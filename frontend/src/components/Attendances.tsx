import * as React from "react"
import { AttendanceType, LectureType } from "../types/models"
import { fEmptyVoid } from "../types/types"
import AttendancePaidButton from "./AttendancePaidButton"
import AttendanceRemindPay from "./AttendanceRemindPay"
import "./Attendances.css"
import AttendanceSelectAttendanceState from "./AttendanceSelectAttendanceState"
import ClientName from "./ClientName"
import LectureNote from "./LectureNote"

type AttendanceProps = {
    attendance: AttendanceType
    showClient: boolean
    funcRefresh: fEmptyVoid
}

/** Komponenta zobrazující jednotlivou účast klienta na dané lekci. */
const Attendance: React.FunctionComponent<AttendanceProps> = ({
    attendance,
    showClient = false,
    funcRefresh
}) => (
    <li data-qa="lecture_attendance">
        {showClient && <ClientName client={attendance.client} link />}{" "}
        <AttendancePaidButton
            paid={attendance.paid}
            attendanceId={attendance.id}
            funcRefresh={funcRefresh}
        />{" "}
        <AttendanceRemindPay attendance={attendance} /> <LectureNote attendance={attendance} />
        <AttendanceSelectAttendanceState
            value={attendance.attendancestate}
            attendanceId={attendance.id}
            funcRefresh={funcRefresh}
        />
    </li>
)

type AttendancesProps = {
    lecture: LectureType
    showClient?: boolean
    funcRefresh: AttendanceProps["funcRefresh"]
}

/** Komponenta zobrazující účasti všech klientů na dané lekci. */
const Attendances: React.FunctionComponent<AttendancesProps> = ({
    lecture,
    showClient = false,
    funcRefresh
}) => {
    const className = "Attendances" + (lecture.group ? " AttendancesGroup" : "")
    return (
        <ul className={className}>
            {lecture.attendances.map(attendance => (
                <Attendance
                    attendance={attendance}
                    key={attendance.id}
                    showClient={showClient}
                    funcRefresh={funcRefresh}
                />
            ))}
        </ul>
    )
}

export default Attendances
