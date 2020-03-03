import * as React from "react"
import { AttendanceType, LectureType } from "../types/models"
import { fEmptyVoid } from "../types/types"
import "./Attendances.css"
import ClientName from "./ClientName"
import LectureNote from "./LectureNote"
import PaidButton from "./PaidButton"
import RemindPay from "./RemindPay"
import SelectAttendanceState from "./SelectAttendanceState"

type AttendanceProps = {
    attendance: AttendanceType
    showClient: boolean
    funcRefresh: fEmptyVoid
}

const Attendance: React.FunctionComponent<AttendanceProps> = ({
    attendance,
    showClient = false,
    funcRefresh
}) => (
    <li data-qa="lecture_attendance">
        {showClient && <ClientName client={attendance.client} link />}{" "}
        <PaidButton paid={attendance.paid} attendanceId={attendance.id} funcRefresh={funcRefresh} />{" "}
        <RemindPay attendance={attendance} /> <LectureNote attendance={attendance} />
        <SelectAttendanceState
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
