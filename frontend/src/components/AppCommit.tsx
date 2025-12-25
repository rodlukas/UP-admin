import * as React from "react"

import { GITHUB_REPO_URL } from "../global/constants"

import * as styles from "./AppCommit.css"
import UncontrolledTooltipWrapper from "./UncontrolledTooltipWrapper"

type Props = {
    /** Název stránky, na které se komponenta používá (musí být unikátní). */
    pageId: string
}

/** Komponenta zobrazující hash commitu příslušné verze aplikace. */
const AppCommit: React.FC<Props> = ({ pageId }) => (
    <>
        <a
            href={`${GITHUB_REPO_URL}/commit/%GIT_COMMIT`}
            target="_blank"
            className={styles.appCommit}
            rel="noopener noreferrer"
            id={`AppCommit_${pageId}`}>
            %GIT_COMMIT
        </a>
        <UncontrolledTooltipWrapper target={`AppCommit_${pageId}`}>
            Zobrazení commitu (GitHub)
        </UncontrolledTooltipWrapper>
    </>
)

export default AppCommit
