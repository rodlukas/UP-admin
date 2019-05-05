import React from "react"
import {Route} from "react-router-dom"
import {getEnvNameShort, isEnvProduction} from "../global/funcEnvironments"

class Page extends Route {
    setTitle() {
        let title = ""
        if (!isEnvProduction())
            title = getEnvNameShort() + " | "
        document.title = title + this.props.title + " – ÚPadmin"
    }

    componentDidMount() {
        this.setTitle()
    }

    componentDidUpdate() {
        this.setTitle()
    }

    render() {
        const {title, ...rest} = this.props
        return <Route {...rest} />
    }
}

export default Page
