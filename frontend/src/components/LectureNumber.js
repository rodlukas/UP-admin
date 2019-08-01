import React from "react"
import {Badge} from "reactstrap"

const LectureNumber = ({lecture, colorize = false}) =>
    lecture.count !== null &&
    <Badge color="secondary" pill className="LectureNumber font-weight-bold"
           style={colorize ? {color: lecture.course.color} : undefined}>
        {lecture.count}
    </Badge>

export default LectureNumber
