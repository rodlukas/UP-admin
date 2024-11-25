import * as React from "react"
import { Badge } from "reactstrap"

import { LectureType } from "../types/models"
import "./LectureNumber.css"

type Props = {
    /** Lekce. */
    lecture: LectureType
    /** Obarvi číslo lekce barvou příslušného kurzu (true). */
    colorize?: boolean
}

/** Komponenta zobrazující pořadové číslo lekce. */
const LectureNumber: React.FC<Props> = ({ lecture, colorize = false }) => {
    if (lecture.number === null) {
        return null
    }
    return (
        <Badge
            color="secondary"
            pill
            className="LectureNumber fw-bold"
            style={colorize ? { color: lecture.course.color } : undefined}>
            {lecture.number}
        </Badge>
    )
}

export default LectureNumber
