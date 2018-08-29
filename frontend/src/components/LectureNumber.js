import React from "react"
import {Badge} from "reactstrap"

const LectureNumber = ({lecture}) =>
    lecture.count !== null &&
        <Badge color="secondary" pill>
            {lecture.count}.
        </Badge>

export default LectureNumber
