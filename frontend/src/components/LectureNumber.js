import React from "react"
import {Badge} from "reactstrap"

const LectureNumber = ({number}) =>
    number !== null &&
        <Badge color="secondary" pill>
            {number}.
        </Badge>

export default LectureNumber
