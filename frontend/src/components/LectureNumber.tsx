import { Badge } from "@mantine/core"
import { assignInlineVars } from "@vanilla-extract/dynamic"
import classNames from "classnames"
import * as React from "react"

import { adjustColorForContrast } from "../global/utils"
import { LectureType } from "../types/models"

import * as styles from "./LectureNumber.css"

// Pozadí pilulky čísla lekce: bílá ve světlém režimu, Mantine dark-6 v tmavém
// (override v DashboardDay.css.ts `lectureNumber`) — vůči těmto barvám se počítá
// kontrast obarveného čísla.
const BADGE_BG_LIGHT = "#ffffff"
const BADGE_BG_DARK = "#2e2e2e" // var(--mantine-color-dark-6)

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
            variant={color === "light" ? "white" : "default"}
            radius="xl"
            fw="bold"
            className={classNames(colorize ? styles.lectureNumber : undefined, className)}
            style={
                colorize
                    ? assignInlineVars(styles.lectureNumberVars, {
                          // světlá barva kurzu by na bílé pilulce nebyla čitelná
                          // (a tmavá na tmavé) — barvu posouváme ke kontrastu 4.5:1
                          colorLight: adjustColorForContrast(lecture.course.color, BADGE_BG_LIGHT),
                          colorDark: adjustColorForContrast(lecture.course.color, BADGE_BG_DARK),
                      })
                    : undefined
            }>
            {lecture.number}
        </Badge>
    )
}

export default LectureNumber
