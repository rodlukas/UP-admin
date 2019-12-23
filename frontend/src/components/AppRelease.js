import React, { Fragment } from "react"
import UncontrolledTooltipWrapper from "./UncontrolledTooltipWrapper"

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
                <UncontrolledTooltipWrapper target="AppRelease">
                    Poznámky k verzi (GitHub)
                </UncontrolledTooltipWrapper>
                {")"}
            </Fragment>
        )
    )
}

export default AppRelease
