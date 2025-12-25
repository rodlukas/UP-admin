import { config } from "@fortawesome/fontawesome-svg-core"
import "@fortawesome/fontawesome-svg-core/styles.css"
import * as Sentry from "@sentry/browser"
import { QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import * as React from "react"
import "bootstrap/dist/css/bootstrap.css"
import { render } from "react-dom"
import { hot } from "react-hot-loader/root"
import { Router } from "react-router-dom"

import { createQueryClient } from "./api/queryClient"
import { AuthProvider } from "./auth/AuthContext"
import GA from "./components/GoogleAnalytics"
import { ClientsActiveProvider } from "./contexts/ClientsActiveContext"
import { GroupsActiveProvider } from "./contexts/GroupsActiveContext"
import { getEnvName, isHosted } from "./global/funcEnvironments"
import history from "./global/history"
import "./index.css"
import { isValidUrl } from "./global/utils"
import Main from "./Main"
import ErrorBoundary from "./pages/ErrorBoundary"

// opatreni kvuli CSP pro FontAwesome, viz https://fontawesome.com/how-to-use/on-the-web/other-topics/security
config.autoAddCss = false

// CI provede substituci stringu za URL, promenna prostredi ale musi existovat, jinak nefunguje (proto podminka)
if (isHosted() && isValidUrl("%SENTRY_DSN")) {
    Sentry.init({
        dsn: "%SENTRY_DSN",
        environment: getEnvName(),
        release: "%GIT_COMMIT",
    })
}

const queryClient = createQueryClient()

/** Základní kostra aplikace. */
const App: React.FC = () => (
    <QueryClientProvider client={queryClient}>
        <Router history={history}>
            <ErrorBoundary>
                {GA.init() && <GA.RouteTracker />}
                <AuthProvider>
                    <ClientsActiveProvider>
                        <GroupsActiveProvider>
                            <Main />
                        </GroupsActiveProvider>
                    </ClientsActiveProvider>
                </AuthProvider>
            </ErrorBoundary>
        </Router>
        <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
)

// react-hot-loader export
export default hot(App)

render(<App />, document.getElementById("root"))
