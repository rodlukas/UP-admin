import React from "react"

const AppVersion = () => (
    <a
        href="https://github.com/rodlukas/UP-admin/commit/%GIT_VERSION"
        target="_blank"
        rel="noopener noreferrer"
        title="Zobrazení commitu (GitHub)">
        %GIT_VERSION
    </a>
)

export default AppVersion
