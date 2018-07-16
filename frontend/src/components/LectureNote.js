import React from "react"
import {Badge} from "reactstrap"

const LectureNote = ({attendance}) =>
    <Badge color="info">
        {attendance.note}
    </Badge>

export default LectureNote
