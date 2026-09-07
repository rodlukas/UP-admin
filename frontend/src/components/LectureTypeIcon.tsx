import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Tooltip } from "@mantine/core"
import { faUser, faUsers } from "@rodlukas/fontawesome-pro-solid-svg-icons"
import classNames from "classnames"
import * as React from "react"

import { LectureType } from "../types/models"

import * as styles from "./LectureTypeIcon.css"

type Props = {
    /** Lekce, jejíž typ se má označit. */
    lecture: LectureType
    /** Dodatečná CSS třída. */
    className?: string
}

/**
 * Ikona typu lekce — individuální vs. skupinová.
 *
 * Sdílená komponenta, protože typ lekce se ukazuje na dvou místech s jinak odlišným
 * vzhledem (pruh lekce v diáři a přehledu, hlavička lekce na kartě klienta) a rozcházet
 * se v nich glyf, tooltip nebo přístupný název by bylo matoucí.
 *
 * Význam nenese jen ikona: `aria-label` i tooltip ho říkají slovem (WCAG 1.4.1).
 */
const LectureTypeIcon: React.FC<Props> = ({ lecture, className }) => {
    const isGroupLecture = Boolean(lecture.group)
    const label = isGroupLecture ? "Skupinová lekce" : "Individuální lekce"
    return (
        <Tooltip label={label}>
            <span
                className={classNames(styles.lectureTypeIcon, className)}
                role="img"
                aria-label={label}>
                <FontAwesomeIcon icon={isGroupLecture ? faUsers : faUser} />
            </span>
        </Tooltip>
    )
}

export default LectureTypeIcon
