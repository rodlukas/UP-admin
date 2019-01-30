import React from "react"
import {Badge} from "reactstrap"

const LectureNote = ({attendance}) =>
    <Badge color="info" data-qa="lecture_attendance_note">
        {attendance.note}
    </Badge>

export default LectureNote
