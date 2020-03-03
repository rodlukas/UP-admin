import * as React from "react"
import { Badge } from "reactstrap"
import { CourseType } from "../types/models"

type Props = {
    course: CourseType
}

const CourseName: React.FunctionComponent<Props> = ({ course }) => (
    <Badge
        color="secondary"
        pill
        data-qa="course_name"
        style={{ background: course.color }}
        className="CourseName">
        {course.name}
    </Badge>
)

export default CourseName
