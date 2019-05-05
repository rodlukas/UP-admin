import React from "react"
import {render} from "react-dom"
import Main from "./Main"
import "bootstrap/dist/css/bootstrap.css"
import "./index.css"
import {AuthProvider} from "./auth/AuthContext"
import * as Sentry from "@sentry/browser"
import {getEnvName, isHosted} from "./global/funcEnvironments"
import {hot} from 'react-hot-loader/root'
import history from "./global/history"
import {Router} from "react-router-dom"
import GA from "./global/GoogleAnalytics"

// CI provede substituci stringu za URL, promenna prostredi ale musi existovat, jinak nefunguje (proto podminka)
if (isHosted())
    Sentry.init({
        dsn: "SENTRY_DSN",
        environment: getEnvName()
    })

const App = () =>
    <Router history={history}>
        {GA.init() && <GA.RouteTracker/>}
        <AuthProvider>
            <Main/>
        </AuthProvider>
    </Router>

// react-hot-loader export
export default hot(App)

render(<App/>, document.getElementById("root"))
