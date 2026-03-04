import { config } from "@fortawesome/fontawesome-svg-core"
import "@fortawesome/fontawesome-svg-core/styles.css"
import * as Sentry from "@sentry/browser"
import { RouterProvider } from "@tanstack/react-router"
import * as React from "react"
import "bootstrap/dist/css/bootstrap.css"
import { createRoot } from "react-dom/client"

import { initAnalytics } from "./analytics"
import { getEnvName, isHosted } from "./global/funcEnvironments"
import "./index.css"
import { isValidUrl } from "./global/utils"
import { router } from "./router"

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

initAnalytics("%GA4_ID", (handler) => {
    router.subscribe("onResolved", handler)
})

/** Základní kostra aplikace. */
const App: React.FC = () => <RouterProvider router={router} />

const container = document.getElementById("root")
if (container) {
    const root = createRoot(container)
    root.render(<App />)
}
