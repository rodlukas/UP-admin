import registerServiceWorker from './registerServiceWorker'
import React from "react"
import {render} from "react-dom"
import Main from "./Main"
import "bootstrap/dist/css/bootstrap.min.css"
import "./index.css"
import {AuthProvider} from "./auth/AuthContext"
import * as Sentry from "@sentry/browser"
import {getEnvName, isEnvProduction} from "./global/funcEnvironments"

// dsn se nahradi url, jinak nefunguje (proto podminka)
if (isEnvProduction())
    Sentry.init({
        dsn: "SENTRY_DSN",
        environment: getEnvName()
    })

const App = () =>
    <AuthProvider>
        <Main/>
    </AuthProvider>

render(<App/>, document.getElementById("root"))
registerServiceWorker()
