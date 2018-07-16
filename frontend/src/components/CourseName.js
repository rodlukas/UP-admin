import React from "react"
import {Badge} from "reactstrap"

const CourseName = ({course}) =>
    <Badge color="secondary" pill>
        {course.name}
    </Badge>

export default CourseName
