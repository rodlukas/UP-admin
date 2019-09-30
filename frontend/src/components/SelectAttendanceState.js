import React, { useContext } from "react"
import AttendanceService from "../api/services/attendance"
import { AttendanceStatesContext } from "../contexts/AttendanceStatesContext"
import CustomCustomInput from "../forms/helpers/CustomCustomInput"

const SelectAttendanceState = props => {
    const { attendancestates } = useContext(AttendanceStatesContext)

    const onChange = e => {
        const newValue = e.target.value
        const id = props.attendanceId
        const data = { id, attendancestate: newValue }
        AttendanceService.patch(data).then(() => props.funcRefresh())
    }

    return (
        <CustomCustomInput
            type="select"
            bsSize="sm"
            onChange={onChange}
            id={"select" + props.attendanceId}
            value={props.value}
            data-qa="lecture_select_attendance_attendancestate">
            {attendancestates.map(
                attendancestate =>
                    // ukaz pouze viditelne, pokud ma klient neviditelny, ukaz ho take
                    (attendancestate.visible || attendancestate.id === props.value) && (
                        <option key={attendancestate.id} value={attendancestate.id}>
                            {attendancestate.name}
                        </option>
                    )
            )}
        </CustomCustomInput>
    )
}

export default SelectAttendanceState
