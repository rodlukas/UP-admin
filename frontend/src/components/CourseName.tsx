import { assignInlineVars } from "@vanilla-extract/dynamic"
import classNames from "classnames"
import * as React from "react"
import { Badge } from "reactstrap"

import { CourseType } from "../types/models"

import * as styles from "./CourseName.css"

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
        style={assignInlineVars(styles.courseNameVars, {
            color: course.color,
        })}
        className={classNames(styles.courseName, className)}>
        {course.name}
    </Badge>
)

export default CourseName
