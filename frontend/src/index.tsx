import { config } from "@fortawesome/fontawesome-svg-core"
import "@fortawesome/fontawesome-svg-core/styles.css"
import * as Sentry from "@sentry/browser"
import { QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import * as React from "react"
import "bootstrap/dist/css/bootstrap.css"
import { createRoot } from "react-dom/client"
import { BrowserRouter, useNavigate } from "react-router-dom"

import { createQueryClient } from "./api/queryClient"
import { AuthProvider } from "./auth/AuthContext"
import { ClientsActiveProvider } from "./contexts/ClientsActiveContext"
import { GroupsActiveProvider } from "./contexts/GroupsActiveContext"
import { getEnvName, isHosted } from "./global/funcEnvironments"
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

/** Základní kostra aplikace. */
const App: React.FC = () => {
    const navigate = useNavigate()
    const queryClient = React.useMemo(() => createQueryClient(navigate), [navigate])

    return (
        <QueryClientProvider client={queryClient}>
            <ErrorBoundary>
                <AuthProvider>
                    <ClientsActiveProvider>
                        <GroupsActiveProvider>
                            <Main />
                        </GroupsActiveProvider>
                    </ClientsActiveProvider>
                </AuthProvider>
            </ErrorBoundary>
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    )
}

const Root: React.FC = () => (
    <BrowserRouter>
        <App />
    </BrowserRouter>
)

const container = document.getElementById("root")
if (container) {
    const root = createRoot(container)
    root.render(<Root />)
}
