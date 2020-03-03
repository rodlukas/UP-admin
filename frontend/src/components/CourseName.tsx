import * as React from "react"
import { Badge } from "reactstrap"
import { CourseType } from "../types/models"

type Props = {
    course: CourseType
}

/** Komponenta pro jednotné zobrazení názvu kurzu napříč aplikací. */
const CourseName: React.FC<Props> = ({ course }) => (
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
