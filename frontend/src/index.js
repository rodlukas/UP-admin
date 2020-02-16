import * as Sentry from "@sentry/browser"
import "bootstrap/dist/css/bootstrap.css"
import React from "react"
import { render } from "react-dom" // eslint-disable-line import/no-unresolved
import { hot } from "react-hot-loader/root"
import { Router } from "react-router-dom"
import { AuthProvider } from "./auth/AuthContext"
import GA from "./components/GoogleAnalytics"
import { ClientsActiveProvider } from "./contexts/ClientsActiveContext"
import { getEnvName, isHosted } from "./global/funcEnvironments"
import history from "./global/history"
import "./index.css"
import Main from "./Main"

// CI provede substituci stringu za URL, promenna prostredi ale musi existovat, jinak nefunguje (proto podminka)
if (isHosted())
    Sentry.init({
        dsn: "%SENTRY_DSN",
        environment: getEnvName(),
        release: "%GIT_COMMIT"
    })

const App = () => (
    <Router history={history}>
        {GA.init() && <GA.RouteTracker />}
        <AuthProvider>
            <ClientsActiveProvider>
                <Main />
            </ClientsActiveProvider>
        </AuthProvider>
    </Router>
)

// react-hot-loader export
export default hot(App)

render(<App />, document.getElementById("root"))
