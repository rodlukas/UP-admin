import React, { Fragment } from "react"
import { UncontrolledTooltip } from "reactstrap"
import { USER_CELEBRATION } from "../global/constants"

const Celebration = ({ isUserCelebratingResult }) =>
    isUserCelebratingResult !== USER_CELEBRATION.NOTHING && (
        <Fragment>
            <UncontrolledTooltip placement="top" target="Celebration">
                Všechno nejlepší k{" "}
                {isUserCelebratingResult === USER_CELEBRATION.BIRTHDAY ? "narozeninám" : "svátku"}!
                😍
            </UncontrolledTooltip>
            <span id="Celebration">🎉</span>
        </Fragment>
    )

export default Celebration
