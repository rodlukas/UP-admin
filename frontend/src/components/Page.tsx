import * as React from "react"
import { Route } from "react-router-dom"
import { getEnvNameShort, isEnvProduction } from "../global/funcEnvironments"
import { CustomRouteProps } from "../types/types"

const Page: React.FunctionComponent<CustomRouteProps> = ({ title, ...rest }) => {
    React.useEffect(() => {
        // nastav title stranky
        const envTitle = !isEnvProduction() ? getEnvNameShort() + " | " : ""
        document.title = envTitle + title + " – ÚPadmin"
    }, [title])

    return <Route {...rest} />
}

export default Page
