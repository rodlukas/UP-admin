import React from "react"
import {Badge} from "reactstrap"
import "./LectureNote.css"

const LectureNote = ({attendance}) =>
    <Badge color="info" data-qa="lecture_attendance_note" className="LectureNote">
        {attendance.note}
    </Badge>

export default LectureNote
