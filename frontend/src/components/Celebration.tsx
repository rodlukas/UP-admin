import * as React from "react"

import { USER_CELEBRATION } from "../global/constants"

import "./Celebration.css"
import UncontrolledTooltipWrapper from "./UncontrolledTooltipWrapper"

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
        <>
            <UncontrolledTooltipWrapper placement="top" target="Celebration">
                Všechno nejlepší k{" "}
                {isUserCelebratingResult === USER_CELEBRATION.BIRTHDAY ? "narozeninám" : "svátku"}!
                😍
            </UncontrolledTooltipWrapper>
            <span id="Celebration" role="img" aria-label="Konfety" className="Celebration">
                🎉
            </span>
        </>
    )
}

export default Celebration
