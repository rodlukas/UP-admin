import React from "react"
import "./Attendances.css"
import ClientName from "./ClientName"
import LectureNote from "./LectureNote"
import PaidButton from "./PaidButton"
import RemindPay from "./RemindPay"
import SelectAttendanceState from "./SelectAttendanceState"

const Attendance = ({attendance, showClient = false, funcRefresh}) =>
    <li data-qa="lecture_attendance">
        {showClient &&
        <ClientName client={attendance.client} link/>}
        {' '}
        <PaidButton paid={attendance.paid} attendanceId={attendance.id}
                    funcRefresh={funcRefresh}/>
        {' '}
        <RemindPay remind_pay={attendance.remind_pay}/>
        {' '}
        <LectureNote attendance={attendance}/>
        <SelectAttendanceState value={attendance.attendancestate}
                               attendanceId={attendance.id}
                               funcRefresh={funcRefresh}/>
    </li>
const Attendances = ({lecture, showClient = false, funcRefresh}) => {
    const className = "Attendances" + (lecture.group ? " AttendancesGroup" : "")
    return (
    <ul className={className}>
        {lecture.attendances.map(attendance =>
            <Attendance attendance={attendance} key={attendance.id} showClient={showClient}
                        funcRefresh={funcRefresh}/>)}
    </ul>)
}


export default Attendances
