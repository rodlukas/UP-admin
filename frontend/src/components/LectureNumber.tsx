import * as React from "react"
import { Badge } from "reactstrap"
import { LectureType } from "../types/models"

type Props = {
    lecture: LectureType
    colorize?: boolean
}

const LectureNumber: React.FunctionComponent<Props> = ({ lecture, colorize = false }) => {
    if (lecture.number === null) return null
    return (
        <Badge
            color="secondary"
            pill
            className="LectureNumber font-weight-bold"
            style={colorize ? { color: lecture.course.color } : undefined}>
            {lecture.number}
        </Badge>
    )
}

export default LectureNumber
