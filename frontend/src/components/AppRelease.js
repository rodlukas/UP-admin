import React, { Fragment } from "react"
import { UncontrolledTooltip } from "reactstrap"

const AppRelease = () => {
    const version = "%GIT_RELEASE"
    return (
        version !== "" && (
            <Fragment>
                {" ("}
                <a
                    href={"https://github.com/rodlukas/UP-admin/releases/tag/" + version}
                    target="_blank"
                    rel="noopener noreferrer"
                    id="AppRelease">
                    {version}
                </a>
                <UncontrolledTooltip target="AppRelease">
                    Poznámky k verzi (GitHub)
                </UncontrolledTooltip>
                {")"}
            </Fragment>
        )
    )
}

export default AppRelease
