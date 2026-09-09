import { Tooltip } from "@mantine/core"
import * as React from "react"

import { USER_CELEBRATION } from "../global/constants"

import * as styles from "./Celebration.css"

type Props = {
    /** ID označující, co slaví lektorka (svátek/narozeniny/nic). */
    isUserCelebratingResult: USER_CELEBRATION
}

/** Komponenta zobrazující přání k svátku/narozeninám lektorky. */
const Celebration: React.FC<Props> = ({ isUserCelebratingResult }) => {
    if (isUserCelebratingResult === USER_CELEBRATION.NOTHING) {
        return null
    }
    const label = `Oslava ${isUserCelebratingResult === USER_CELEBRATION.BIRTHDAY ? "narozenin" : "svátku"}`
    return (
        <Tooltip
            label={`Všechno nejlepší k ${isUserCelebratingResult === USER_CELEBRATION.BIRTHDAY ? "narozeninám" : "svátku"}! 😍`}
            position="top"
            // focus + tabIndex: obsah tooltipu musí být dosažitelný i z klávesnice (WCAG 1.4.13)
            events={{ hover: true, focus: true, touch: true }}>
            {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- trigger tooltipu
                musí být fokusovatelný, jinak je obsah jen pro myš (WAI-ARIA tooltip pattern) */}
            <span role="img" aria-label={label} tabIndex={0} className={styles.celebration}>
                🎉
            </span>
        </Tooltip>
    )
}

export default Celebration
