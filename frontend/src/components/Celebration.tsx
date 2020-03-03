import * as React from "react"
import { USER_CELEBRATION } from "../global/constants"
import UncontrolledTooltipWrapper from "./UncontrolledTooltipWrapper"

type Props = {
    isUserCelebratingResult: number
}

const Celebration: React.FunctionComponent<Props> = ({ isUserCelebratingResult }) => {
    if (isUserCelebratingResult === USER_CELEBRATION.NOTHING) return null
    return (
        <>
            <UncontrolledTooltipWrapper placement="top" target="Celebration">
                Všechno nejlepší k{" "}
                {isUserCelebratingResult === USER_CELEBRATION.BIRTHDAY ? "narozeninám" : "svátku"}!
                😍
            </UncontrolledTooltipWrapper>
            <span id="Celebration" role="img" aria-label="Konfety">
                🎉
            </span>
        </>
    )
}

export default Celebration
