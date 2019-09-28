import React from "react"
import "./AppVersion.css"

const AppVersion = () => (
    <a
        href="https://github.com/rodlukas/UP-admin/commit/%GIT_VERSION"
        target="_blank"
        className="AppVersion"
        rel="noopener noreferrer"
        title="Zobrazení commitu (GitHub)">
        %GIT_VERSION
    </a>
)

export default AppVersion
