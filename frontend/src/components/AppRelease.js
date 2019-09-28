import React, { Fragment } from "react"

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
                    title="Poznámky k verzi (GitHub)">
                    {version}
                </a>
                {")"}
            </Fragment>
        )
    )
}

export default AppRelease
