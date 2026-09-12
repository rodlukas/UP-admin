import { Tooltip } from "@mantine/core"
import { assignInlineVars } from "@vanilla-extract/dynamic"
import classNames from "classnames"
import * as React from "react"

import * as styles from "./CourseCircle.css"

type Props = {
    /** Barva kolečka u kurzu. */
    color: string
    /** Velikost kolečka u kurzu. */
    size: number
    /** Zobraz titulek s kódem barvy (true). */
    showTitle?: boolean
    /** Dodatečná CSS třída. */
    className?: string
}

/** Komponenta zobrazující barevné kolečko s různou barvou a velikostí pro zobrazení barvy kurzu. */
const CourseCircle: React.FC<Props> = ({ color, size, showTitle = false, className }) => {
    const circle = (
        <span
            data-qa="course_color"
            // E2E cte skutecnou nakonfigurovanou barvu odsud, ne z computed background-color —
            // ten po `courseColorTint` (viz CourseCircle.css.ts) uz neni puvodni hex, ale
            // prolnuty s podkladem kvuli citelnosti na tmave/svetle plose
            data-color={color}
            className={classNames(styles.courseCircle, className)}
            style={assignInlineVars({
                [styles.circleColor]: color,
                [styles.circleSize]: `${size}rem`,
            })}
        />
    )

    return showTitle ? (
        <Tooltip label={`Kód barvy: ${color}`}>
            {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- trigger tooltipu
                musí být fokusovatelný, jinak je obsah jen pro myš (WAI-ARIA tooltip pattern) */}
            <span tabIndex={0} role="img" aria-label={`Kód barvy: ${color}`}>
                {circle}
            </span>
        </Tooltip>
    ) : (
        circle
    )
}

export default CourseCircle
