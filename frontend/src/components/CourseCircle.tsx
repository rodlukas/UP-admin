import classNames from "classnames"
import * as React from "react"

import * as styles from "./CourseCircle.css"
import UncontrolledTooltipWrapper from "./UncontrolledTooltipWrapper"

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
    const sizeWithUnit = `${size}rem`
    const colorWithoutHash = color.substring(1)

    return (
        <>
            <span
                data-qa="course_color"
                className={classNames(styles.courseCircle, className)}
                id={`CourseCircle_${colorWithoutHash}`}
                style={{
                    background: color,
                    width: sizeWithUnit,
                    height: sizeWithUnit,
                }}
            />
            {showTitle && (
                <UncontrolledTooltipWrapper target={`CourseCircle_${colorWithoutHash}`}>
                    Kód barvy: {color}
                </UncontrolledTooltipWrapper>
            )}
        </>
    )
}

export default CourseCircle
