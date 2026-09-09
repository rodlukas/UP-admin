import { Tooltip } from "@mantine/core"
import * as React from "react"

import { GITHUB_REPO_URL } from "../global/constants"

import * as styles from "./AppCommit.css"

/** Komponenta zobrazující hash commitu příslušné verze aplikace. */
const AppCommit: React.FC = () => (
    <Tooltip label="Zobrazení commitu (GitHub)">
        <a
            href={`${GITHUB_REPO_URL}/commit/%GIT_COMMIT`}
            target="_blank"
            className={styles.appCommit}
            rel="noopener noreferrer">
            %GIT_COMMIT
        </a>
    </Tooltip>
)

export default AppCommit
