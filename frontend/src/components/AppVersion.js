import React, { Fragment } from "react"
import "./AppVersion.css"
import UncontrolledTooltipWrapper from "./UncontrolledTooltipWrapper"

const AppVersion = () => (
    <Fragment>
        <a
            href="https://github.com/rodlukas/UP-admin/commit/%GIT_VERSION"
            target="_blank"
            className="AppVersion"
            rel="noopener noreferrer"
            id="AppVersion">
            %GIT_VERSION
        </a>
        <UncontrolledTooltipWrapper target="AppVersion">
            Zobrazení commitu (GitHub)
        </UncontrolledTooltipWrapper>
    </Fragment>
)

export default AppVersion
