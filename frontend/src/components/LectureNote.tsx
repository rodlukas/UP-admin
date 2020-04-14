import * as React from "react"
import { Badge } from "reactstrap"
import { AttendanceType } from "../types/models"
import "./LectureNote.css"

type Props = {
    /** Účast klienta na lekci. */
    attendance: AttendanceType
}

/** Komponenta zobrazující poznámku k lekci. */
const LectureNote: React.FC<Props> = ({ attendance }) => (
    <Badge color="secondary" data-qa="lecture_attendance_note" className="LectureNote">
        {attendance.note}
    </Badge>
)

export default LectureNote
