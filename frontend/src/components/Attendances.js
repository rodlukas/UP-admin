import React from "react"
import LectureNote from "./LectureNote"
import PaidButton from "./PaidButton"
import SelectAttendanceState from "./SelectAttendanceState"
import ClientName from "./ClientName"
import RemindPay from "./RemindPay"
import "./Attendances.css"

const Attendance = ({attendance, showClient = false, funcRefresh}) =>
    <li>
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
