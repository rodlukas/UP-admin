import React, {useEffect} from "react"
import {Route} from "react-router-dom"
import {getEnvNameShort, isEnvProduction} from "../global/funcEnvironments"


const Page = props => {
    const {title, ...rest} = props

    useEffect(() => {
        // nastav title stranky
        const envTitle = !isEnvProduction()
            ? getEnvNameShort() + " | "
            : ""
        document.title = envTitle + title + " – ÚPadmin"
    }, [title])

    return <Route {...rest} />
}

export default Page
