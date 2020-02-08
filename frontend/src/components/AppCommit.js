import React, { Fragment } from "react"
import { GITHUB_REPO_URL } from "../global/constants"
import "./AppCommit.css"
import UncontrolledTooltipWrapper from "./UncontrolledTooltipWrapper"

const AppCommit = () => (
    <Fragment>
        <a
            href={GITHUB_REPO_URL + "/commit/%GIT_COMMIT"}
            target="_blank"
            className="AppCommit"
            rel="noopener noreferrer"
            id="AppCommit">
            %GIT_COMMIT
        </a>
        <UncontrolledTooltipWrapper target="AppCommit">
            Zobrazení commitu (GitHub)
        </UncontrolledTooltipWrapper>
    </Fragment>
)

export default AppCommit
