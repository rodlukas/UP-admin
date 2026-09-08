import { config } from "@fortawesome/fontawesome-svg-core"
import "@fortawesome/fontawesome-svg-core/styles.css"
import { localStorageColorSchemeManager, MantineProvider } from "@mantine/core"
import "@mantine/core/styles.css"
import { Notifications } from "@mantine/notifications"
import "@mantine/notifications/styles.css"
import "@mantine/spotlight/styles.css"
import * as Sentry from "@sentry/browser"
import { RouterProvider } from "@tanstack/react-router"
import * as React from "react"
import { createRoot } from "react-dom/client"

import { initAnalytics } from "./analytics"
import { COLOR_SCHEME_STORAGE_KEY } from "./global/constants"
import { getEnvName, isHosted } from "./global/funcEnvironments"
import "./index.css"
import { isValidUrl } from "./global/utils"
import { router } from "./router"
import { theme } from "./theme/theme"

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

const colorSchemeManager = localStorageColorSchemeManager({ key: COLOR_SCHEME_STORAGE_KEY })

/** Základní kostra aplikace. */
const App: React.FC = () => (
    <MantineProvider
        theme={theme}
        defaultColorScheme="light"
        colorSchemeManager={colorSchemeManager}>
        {/* position: `bottom-right`, ne `top-right`. Aplikace nemá horní lištu (navigace
            je v inkoustovém pruhu vlevo), takže hlavička stránky s akčními tlačítky sedí
            u horní hrany okna — toasty vpravo nahoře ji zakrývaly. Dřív je odtlačoval
            fixní navbar, dnes tam nic není. Projevilo se to i v E2E:
            ElementClickInterceptedException na tlačítku v hlavičce stránky.
            zIndex: default 400 by toasty schoval pod modaly (1050); notifikace patří nad
            vše včetně tooltipů (1300) — jinak uživatel nevidí chybové hlášky z formulářů
            v modalech */}
        <Notifications position="bottom-right" limit={5} zIndex={1400} />
        <RouterProvider router={router} />
    </MantineProvider>
)

const container = document.getElementById("root")
if (container) {
    const root = createRoot(container)
    root.render(<App />)
}
