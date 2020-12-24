import * as React from "react"

import { GITHUB_REPO_URL } from "../global/constants"

import "./AppCommit.css"
import UncontrolledTooltipWrapper from "./UncontrolledTooltipWrapper"

/** Komponenta zobrazující hash commitu příslušné verze aplikace. */
const AppCommit: React.FC = () => (
    <>
        <a
            href={`${GITHUB_REPO_URL}/commit/%GIT_COMMIT`}
            target="_blank"
            className="AppCommit"
            rel="noopener noreferrer"
            id="AppCommit">
            %GIT_COMMIT
        </a>
        <UncontrolledTooltipWrapper target="AppCommit">
            Zobrazení commitu (GitHub)
        </UncontrolledTooltipWrapper>
    </>
)

export default AppCommit
