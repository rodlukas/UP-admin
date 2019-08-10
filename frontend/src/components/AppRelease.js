import React, { Fragment } from "react"
import "./AppVersion.css"

const AppRelease = () => {
    const version = "GIT_RELEASE"
    return (
        version !== "" && (
            <Fragment>
                {" ("}
                <a
                    href={"https://github.com/rodlukas/UP-admin/releases/tag/" + version}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="AppVersion">
                    {version}
                </a>
                {")"}
            </Fragment>
        )
    )
}

export default AppRelease
