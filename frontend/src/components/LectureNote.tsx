import * as React from "react"
import { Badge } from "reactstrap"
import { AttendanceType } from "../types/models"
import "./LectureNote.css"

type Props = {
    attendance: AttendanceType
}

const LectureNote: React.FunctionComponent<Props> = ({ attendance }) => (
    <Badge color="secondary" data-qa="lecture_attendance_note" className="LectureNote">
        {attendance.note}
    </Badge>
)

export default LectureNote
