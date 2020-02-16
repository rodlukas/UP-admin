import React, { Fragment } from "react"
import { USER_CELEBRATION } from "../global/constants"
import UncontrolledTooltipWrapper from "./UncontrolledTooltipWrapper"

const Celebration = ({ isUserCelebratingResult }) =>
    isUserCelebratingResult !== USER_CELEBRATION.NOTHING && (
        <Fragment>
            <UncontrolledTooltipWrapper placement="top" target="Celebration">
                Všechno nejlepší k{" "}
                {isUserCelebratingResult === USER_CELEBRATION.BIRTHDAY ? "narozeninám" : "svátku"}!
                😍
            </UncontrolledTooltipWrapper>
            <span id="Celebration" role="img" aria-label="Konfety">
                🎉
            </span>
        </Fragment>
    )

export default Celebration
