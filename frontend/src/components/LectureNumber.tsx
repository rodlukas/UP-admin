import classNames from "classnames"
import * as React from "react"
import { Badge } from "reactstrap"

import { LectureType } from "../types/models"

type Props = {
    /** Lekce. */
    lecture: LectureType
    /** Obarvi číslo lekce barvou příslušného kurzu (true). */
    colorize?: boolean
    /** Dodatečná CSS třída. */
    className?: string
}

/** Komponenta zobrazující pořadové číslo lekce. */
const LectureNumber: React.FC<Props> = ({ lecture, colorize = false, className }) => {
    if (lecture.number === null) {
        return null
    }
    return (
        <Badge
            color="secondary"
            pill
            className={classNames("font-weight-bold", className)}
            style={colorize ? { color: lecture.course.color } : undefined}>
            {lecture.number}
        </Badge>
    )
}

export default LectureNumber
