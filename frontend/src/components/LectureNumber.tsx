import { assignInlineVars } from "@vanilla-extract/dynamic"
import classNames from "classnames"
import * as React from "react"
import { Badge } from "reactstrap"

import { LectureType } from "../types/models"

import * as styles from "./LectureNumber.css"

type Props = {
    /** Lekce. */
    lecture: LectureType
    /** Obarvi číslo lekce barvou příslušného kurzu (true). */
    colorize?: boolean
    /** Dodatečná CSS třída. */
    className?: string
    /** Barva pozadí. */
    color?: "secondary" | "light"
}

/** Komponenta zobrazující pořadové číslo lekce. */
const LectureNumber: React.FC<Props> = ({
    lecture,
    colorize = false,
    className,
    color = "secondary",
}) => {
    if (lecture.number === null) {
        return null
    }
    return (
        <Badge
            color={color}
            pill
            className={classNames(
                "fw-bold",
                colorize ? styles.lectureNumber : undefined,
                className,
            )}
            style={
                colorize
                    ? assignInlineVars(styles.lectureNumberVars, {
                          color: lecture.course.color,
                      })
                    : undefined
            }>
            {lecture.number}
        </Badge>
    )
}

export default LectureNumber
