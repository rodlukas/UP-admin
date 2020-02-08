import React, { Fragment } from "react"
import { GITHUB_REPO_URL } from "../global/constants"
import UncontrolledTooltipWrapper from "./UncontrolledTooltipWrapper"

const AppRelease = () => {
    const version = "%GIT_RELEASE"
    const branch_or_version = "%GIT_BRANCH"
    function isTaggedCommit() {
        return version !== ""
    }
    return (
        <Fragment>
            {" ("}
            {!isTaggedCommit() && "větev "}
            <a
                href={
                    GITHUB_REPO_URL +
                    (isTaggedCommit() ? "/releases/tag/" : "/tree/") +
                    branch_or_version
                }
                target="_blank"
                rel="noopener noreferrer"
                id="AppRelease">
                {branch_or_version}
            </a>
            <UncontrolledTooltipWrapper target="AppRelease">
                {isTaggedCommit() ? "Poznámky k verzi" : "Přejít na větev"} (GitHub)
            </UncontrolledTooltipWrapper>
            {")"}
        </Fragment>
    )
}

export default AppRelease
