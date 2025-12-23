import * as React from "react"
import { Badge } from "reactstrap"

import { CourseType } from "../types/models"

type Props = {
    /** Kurz. */
    course: CourseType
    /** Dodatečná CSS třída. */
    className?: string
}

/** Komponenta pro jednotné zobrazení názvu kurzu napříč aplikací. */
const CourseName: React.FC<Props> = ({ course, className }) => (
    <Badge
        color="secondary"
        pill
        data-qa="course_name"
        style={{ background: course.color }}
        className={className}>
        {course.name}
    </Badge>
)

export default CourseName
