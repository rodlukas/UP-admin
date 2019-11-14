import React, { Fragment } from "react"
import { UncontrolledTooltip } from "reactstrap"
import "./AppVersion.css"

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
        <UncontrolledTooltip target="AppVersion">Zobrazení commitu (GitHub)</UncontrolledTooltip>
    </Fragment>
)

export default AppVersion
