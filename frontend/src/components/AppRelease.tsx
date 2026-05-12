import { Tooltip } from "@mantine/core"
import * as React from "react"

import { GITHUB_REPO_URL } from "../global/constants"

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
            <Tooltip label={`${isTaggedCommit() ? "Poznámky k verzi" : "Přejít na větev"} (GitHub)`}>
                <a
                    href={
                        GITHUB_REPO_URL +
                        (isTaggedCommit() ? "/releases/tag/" : "/tree/") +
                        branchOrVersion
                    }
                    target="_blank"
                    rel="noopener noreferrer">
                    {branchOrVersion}
                </a>
            </Tooltip>
        </>
    )
}

export default AppRelease
