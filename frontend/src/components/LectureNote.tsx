import { Badge } from "@mantine/core"
import classNames from "classnames"
import * as React from "react"

import { AttendanceType } from "../types/models"

import * as styles from "./LectureNote.css"

type Props = {
    /** Účast klienta na lekci. */
    attendance: AttendanceType
    /** Dodatečná CSS třída. */
    className?: string
}

/** Komponenta zobrazující poznámku k lekci. */
const LectureNote: React.FC<Props> = ({ attendance, className }) => {
    if (!attendance.note) {
        return null
    }
    return (
        <Badge
            variant="default"
            data-qa="lecture_attendance_note"
            data-gdpr
            className={classNames(styles.lectureNote, className)}>
            {attendance.note}
        </Badge>
    )
}

export default LectureNote
