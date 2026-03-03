import createCache from "@emotion/cache"
import { CacheProvider } from "@emotion/react"
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
import { getCspNonce, isValidUrl } from "./global/utils"
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

// Emotion cache s CSP nonce, aby react-select a další emotion-based knihovny
// injekovaly <style> tagy s nonce atributem (vyžadováno CSP style-src 'nonce-...')
const emotionCache = createCache({ key: "css", nonce: getCspNonce() })

const container = document.getElementById("root")
if (container) {
    const root = createRoot(container)
    root.render(
        <CacheProvider value={emotionCache}>
            <App />
        </CacheProvider>,
    )
}
