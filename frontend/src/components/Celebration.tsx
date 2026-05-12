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
    return (
        <Tooltip
            label={`Všechno nejlepší k ${isUserCelebratingResult === USER_CELEBRATION.BIRTHDAY ? "narozeninám" : "svátku"}! 😍`}
            position="top">
            <span role="img" aria-label="Konfety" className={styles.celebration}>
                🎉
            </span>
        </Tooltip>
    )
}

export default Celebration
