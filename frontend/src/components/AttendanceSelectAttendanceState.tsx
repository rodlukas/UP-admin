import * as React from "react"

import AttendanceService from "../api/services/AttendanceService"
import { useAttendanceStatesContext } from "../contexts/AttendanceStatesContext"
import CustomInputWrapper from "../forms/helpers/CustomInputWrapper"
import { AttendanceStateType, AttendanceType } from "../types/models"
import { fEmptyVoid } from "../types/types"

type Props = {
    /** Funkce, která se zavolá po aktualizaci stavu účasti. */
    funcRefresh: fEmptyVoid
    /** ID účasti. */
    attendanceId: AttendanceType["id"]
    /** ID stavu účasti. */
    value: AttendanceStateType["id"]
}

/** Komponenta zobrazující box pro výběr stavu účasti klienta na dané lekci. */
const AttendanceSelectAttendanceState: React.FC<Props> = (props) => {
    const { attendancestates } = useAttendanceStatesContext()

    const onChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const newValue = Number(e.currentTarget.value)
        const id = props.attendanceId
        const data = { id, attendancestate: newValue }
        AttendanceService.patch(data).then(() => props.funcRefresh())
    }

    return (
        <CustomInputWrapper
            type="select"
            bsSize="sm"
            onChange={onChange}
            id={`select${props.attendanceId}`}
            value={props.value}
            data-qa="lecture_select_attendance_attendancestate">
            {attendancestates.map(
                (attendancestate) =>
                    // ukaz pouze viditelne, pokud ma klient neviditelny, ukaz ho take
                    (attendancestate.visible || attendancestate.id === props.value) && (
                        <option key={attendancestate.id} value={attendancestate.id}>
                            {attendancestate.name}
                        </option>
                    ),
            )}
        </CustomInputWrapper>
    )
}

export default AttendanceSelectAttendanceState
