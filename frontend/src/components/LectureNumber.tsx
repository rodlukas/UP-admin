import classNames from "classnames"
import * as React from "react"

import { LectureType } from "../types/models"

import * as styles from "./LectureNumber.css"

type Props = {
    /** Lekce. */
    lecture: LectureType
    /** Dodatečná CSS třída. */
    className?: string
}

/**
 * Komponenta zobrazující pořadové číslo lekce.
 * Dřív obarvená pilulka; dnes tlumený ordinál tabulkovými číslicemi — samotné číslo
 * („2") u času nic neříkalo, tečka z něj dělá „2. lekce“ a barvu už nese linka lekce.
 */
const LectureNumber: React.FC<Props> = ({ lecture, className }) => {
    if (lecture.number === null) {
        return null
    }
    return (
        <span
            className={classNames(styles.lectureNumber, className)}
            title={`${lecture.number}. lekce`}>
            {lecture.number}.
        </span>
    )
}

export default LectureNumber
