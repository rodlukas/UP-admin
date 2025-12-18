import * as React from "react"

import { usePatchAttendance } from "../api/hooks"
import { useAttendanceStatesContext } from "../contexts/AttendanceStatesContext"
import CustomInputWrapper from "../forms/helpers/CustomInputWrapper"
import { AttendanceStateType, AttendanceType } from "../types/models"

type Props = {
    /** ID účasti. */
    attendanceId: AttendanceType["id"]
    /** ID stavu účasti. */
    value: AttendanceStateType["id"]
}

/** Komponenta zobrazující box pro výběr stavu účasti klienta na dané lekci. */
const AttendanceSelectAttendanceState: React.FC<Props> = (props) => {
    const { attendancestates } = useAttendanceStatesContext()
    const patchAttendance = usePatchAttendance({
        successMessage: "Stav účasti klienta uložen",
    })

    const onChange = React.useCallback(
        (e: React.ChangeEvent<HTMLInputElement>): void => {
            const newValue = Number(e.currentTarget.value)
            const id = props.attendanceId
            const data = { id, attendancestate: newValue }
            patchAttendance.mutate(data)
        },
        [props.attendanceId, patchAttendance],
    )

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
