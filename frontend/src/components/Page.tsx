import * as React from "react"
import { Route } from "react-router-dom"
import { getEnvNameShort, isEnvProduction } from "../global/funcEnvironments"
import { CustomRouteProps } from "../types/types"

/** Komponenta zajišťující zobrazení jakékoliv stránky aplikace spolu s příslušným title v prohlížeči. */
const Page: React.FC<CustomRouteProps> = ({ title, ...rest }) => {
    React.useEffect(() => {
        // nastav title stranky
        const envTitle = !isEnvProduction() ? getEnvNameShort() + " | " : ""
        document.title = envTitle + title + " – ÚPadmin"
    }, [title])

    return <Route {...rest} />
}

export default Page
