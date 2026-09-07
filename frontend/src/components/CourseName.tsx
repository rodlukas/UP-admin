import { assignInlineVars } from "@vanilla-extract/dynamic"
import classNames from "classnames"
import * as React from "react"

import { contrastingTextColor } from "../global/utils"
import { CourseType } from "../types/models"

import * as styles from "./CourseName.css"

type Props = {
    /** Kurz. */
    course: CourseType
    /** Dodatečná CSS třída. */
    className?: string
    /**
     * Zobraz před názvem tečku v barvě kurzu (true, výchozí). Vypni tam, kde barvu kurzu
     * nese už něco jiného — v diáři a přehledu je to pruh hlavičky lekce
     * (`lectureHeader`), tečka by tam barvu jen zdvojovala.
     */
    withDot?: boolean
    /**
     * Vykresli název jako **sytý chip v barvě kurzu** (`courseBand`) místo tiché tečky.
     * Pro místa, kde má být kurz poznat na první pohled — v hustém seznamu skupin se
     * tečka 0,55 rem mezi jmény ztrácela. Tečka zůstává tichou variantou.
     */
    band?: boolean
}

/**
 * Komponenta pro jednotné zobrazení názvu kurzu napříč aplikací.
 * Dřív sytá pilulka v barvě kurzu; dnes obyčejný text, protože v plochém jazyce nese
 * barvu linka u lekce a pilulka na ploše zbytečně křičela.
 */
const CourseName: React.FC<Props> = ({ course, className, withDot = true, band = false }) => {
    if (band) {
        return (
            <span
                data-qa="course_name"
                style={assignInlineVars(styles.courseBandVars, {
                    color: course.color,
                    text: contrastingTextColor(course.color),
                })}
                className={classNames(styles.courseChip, className)}>
                {course.name}
            </span>
        )
    }
    return (
        <span
            data-qa="course_name"
            style={
                withDot
                    ? assignInlineVars(styles.courseNameVars, { color: course.color })
                    : undefined
            }
            className={classNames(styles.courseName, className)}>
            {withDot && <span className={styles.courseDot} aria-hidden="true" />}
            {course.name}
        </span>
    )
}

export default CourseName
