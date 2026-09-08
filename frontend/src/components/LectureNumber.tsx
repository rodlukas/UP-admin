import { Tooltip } from "@mantine/core"
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
 * Komponenta zobrazující pořadové číslo lekce — tlumený ordinál tabulkovými číslicemi.
 * Tečka za číslem je podstatná: samotná „2" u času nic neříká, „2." se čte jako
 * „2. lekce" (plné znění nese tooltip a `aria-label`). Barvu kurzu drží linka lekce,
 * tady by druhá barevná plocha soupeřila o pozornost.
 */
const LectureNumber: React.FC<Props> = ({ lecture, className }) => {
    if (lecture.number === null) {
        return null
    }
    const label = `${lecture.number}. lekce`
    const spanClassName = classNames(styles.lectureNumber, className)
    return (
        <Tooltip
            label={label}
            // focus + tabIndex: obsah tooltipu musí být dosažitelný i z klávesnice (WCAG 1.4.13)
            events={{ hover: true, focus: true, touch: true }}>
            {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- trigger tooltipu
                musí být fokusovatelný, jinak je obsah jen pro myš (WAI-ARIA tooltip pattern) */}
            <span className={spanClassName} tabIndex={0} aria-label={label}>
                {lecture.number}.
            </span>
        </Tooltip>
    )
}

export default LectureNumber
