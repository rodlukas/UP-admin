import React from "react"
import {Badge} from "reactstrap"

const CourseName = ({course}) =>
    <Badge color="secondary" pill data-qa="course_name">
        {course.name}
    </Badge>

export default CourseName
