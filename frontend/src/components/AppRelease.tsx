import * as React from "react"

import { GITHUB_REPO_URL } from "../global/constants"

import UncontrolledTooltipWrapper from "./UncontrolledTooltipWrapper"

/** Komponenta zobrazující číslo verze aplikace. */
const AppRelease: React.FC = () => {
    const version = "%GIT_RELEASE"
    const branchOrVersion = "%GIT_BRANCH"

    function isTaggedCommit(): boolean {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return version !== ""
    }

    return (
        <>
            {!isTaggedCommit() && "větev "}
            <a
                href={
                    GITHUB_REPO_URL +
                    (isTaggedCommit() ? "/releases/tag/" : "/tree/") +
                    branchOrVersion
                }
                target="_blank"
                rel="noopener noreferrer"
                id="AppRelease">
                {branchOrVersion}
            </a>
            <UncontrolledTooltipWrapper target="AppRelease">
                {isTaggedCommit() ? "Poznámky k verzi" : "Přejít na větev"} (GitHub)
            </UncontrolledTooltipWrapper>
        </>
    )
}

export default AppRelease
