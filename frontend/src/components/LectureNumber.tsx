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
 *
 * `lecture.number` může být místo čísla i varovná VĚTA (chybějící výchozí stav účasti,
 * viz `LectureNumberOrWarning`) — v tom případě se zobrazí beze změny, bez tečky
 * a bez „lekce" navíc (jinak by výsledek byl „⚠ … nastavení. lekce").
 */
const LectureNumber: React.FC<Props> = ({ lecture, className }) => {
    const isOrdinal = typeof lecture.number === "number"
    // `String(...)`: `aria-label` musí být string, `lecture.number` (mimo `isOrdinal`
    // větev) je ale pořád typovaný jako `LectureNumberOrWarning` (union) — `isOrdinal` je
    // samostatná proměnná, ne type guard přímo na `lecture.number`, takže TS ho tady
    // nezúží automaticky.
    const label = String(isOrdinal ? `${lecture.number}. lekce` : lecture.number)
    const spanClassName = classNames(styles.lectureNumber, className)
    return (
        <Tooltip
            label={label}
            // focus + tabIndex: obsah tooltipu musí být dosažitelný i z klávesnice (WCAG 1.4.13)
            events={{ hover: true, focus: true, touch: true }}>
            {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- trigger tooltipu
                musí být fokusovatelný, jinak je obsah jen pro myš (WAI-ARIA tooltip pattern) */}
            <span className={spanClassName} tabIndex={0} aria-label={label}>
                {isOrdinal ? `${lecture.number}.` : lecture.number}
            </span>
        </Tooltip>
    )
}

export default LectureNumber
