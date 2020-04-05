import * as React from "react"
import { Route } from "react-router-dom"
import { pageTitle } from "../global/utils"
import { CustomRouteProps } from "../types/types"

/** Komponenta zajišťující zobrazení jakékoliv stránky aplikace spolu s příslušným title v prohlížeči. */
const Page: React.FC<CustomRouteProps> = ({ title, ...rest }) => {
    React.useEffect(() => {
        // nastav title stranky
        document.title = pageTitle(title)
    }, [title])

    return <Route {...rest} title={title} />
}

export default Page
