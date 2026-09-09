import { createRootRoute, createRoute, createRouter } from "@tanstack/react-router"
import * as React from "react"

import { createQueryClient } from "./api/queryClient"
import AppLayout from "./App"
import APP_URLS from "./APP_URLS"
import PrivateRoute from "./auth/PrivateRoute"
import LoginSkeleton from "./components/LoginSkeleton"
import Page from "./components/Page"
import { PageSkeleton } from "./components/Skeletons"
import lazySafe from "./global/lazySafe"

// lazy nacitani pro jednotlive stranky
const Dashboard = React.lazy(() => lazySafe(() => import("./pages/Dashboard")))
const NotFound = React.lazy(() => lazySafe(() => import("./pages/NotFound")))
const Settings = React.lazy(() => lazySafe(() => import("./pages/Settings")))
const Applications = React.lazy(() => lazySafe(() => import("./pages/Applications")))
const Groups = React.lazy(() => lazySafe(() => import("./pages/Groups")))
const Login = React.lazy(() => lazySafe(() => import("./pages/Login")))
const Clients = React.lazy(() => lazySafe(() => import("./pages/Clients")))
const Card = React.lazy(() => lazySafe(() => import("./pages/Card")))
const Diary = React.lazy(() => lazySafe(() => import("./pages/Diary")))
const Statistics = React.lazy(() => lazySafe(() => import("./pages/Statistics")))

const queryClient = createQueryClient()

const rootRoute = createRootRoute({
    component: () => <AppLayout queryClient={queryClient} />,
    notFoundComponent: () => (
        <Page title={APP_URLS.nenalezeno.title}>
            <NotFound />
        </Page>
    ),
})

type ChildRouteConfig = {
    path: string
    id?: string
    component: () => React.ReactElement
    validateSearch?: (search: Record<string, unknown>) => {
        redirect?: string
    }
}

const createChildRoute = (routeConfig: ChildRouteConfig) =>
    createRoute({
        ...routeConfig,
        getParentRoute: () => rootRoute,
    })

const createPrivateRoute = (path: string, element: React.ReactElement, title?: string) =>
    createChildRoute({
        path,
        component: () => <PrivateRoute title={title}>{element}</PrivateRoute>,
    })

const createPageRoute = (path: string, element: React.ReactElement, title: string) =>
    createChildRoute({
        path,
        component: () => <Page title={title}>{element}</Page>,
    })

const overviewRoute = createPrivateRoute(
    APP_URLS.prehled.url,
    <Dashboard />,
    APP_URLS.prehled.title,
)

const loginRoute = createChildRoute({
    path: APP_URLS.prihlasit.url,
    validateSearch: (search: Record<string, unknown>) => ({
        redirect: typeof search.redirect === "string" ? search.redirect : undefined,
    }),
    component: () => (
        <Page title={APP_URLS.prihlasit.title}>
            {/* Vlastní hranice, ne ta sdílená v Main.tsx (`PageSkeleton`) — tu si nadál
                drží i `NotFound`, jehož tvar (`Container` + nadpis) kostře tabulky
                odpovídá o dost líp než přihlašovací kartě. */}
            <React.Suspense fallback={<LoginSkeleton />}>
                <Login />
            </React.Suspense>
        </Page>
    ),
})

const groupsRoute = createPrivateRoute(APP_URLS.skupiny.url, <Groups />, APP_URLS.skupiny.title)

const diaryRoutes = [APP_URLS.diar.url, `${APP_URLS.diar.url}/$year/$month/$day`].map((path) =>
    createPrivateRoute(path, <Diary />),
)

const clientsRoute = createPrivateRoute(APP_URLS.klienti.url, <Clients />, APP_URLS.klienti.title)

const createCardRoute = (path: string, isClientPage: boolean) => {
    let route: ReturnType<typeof createChildRoute>
    route = createChildRoute({
        path,
        component: () => {
            const { id } = route.useParams()
            // `key={id}`: TanStack Router mění jen `useParams()` a stejnou instanci `Card`
            // (žádný `remountDeps`/`defaultRemountDeps` v konfiguraci routeru) při přechodu
            // mezi kartami recykluje, takže bez tohoto klíče by veškerý interní stav (vybraná
            // záložka, jednorázově zapnuté dotazy…) přetekl z předchozí karty na další —
            // viz `Card.tsx`, kde na to spoléhá výchozí záložka „Lekce" i lazy-enable Analýzy.
            return (
                <PrivateRoute>
                    <Card key={id} id={Number(id)} isClientPage={isClientPage} />
                </PrivateRoute>
            )
        },
    })
    return route
}

const clientCardRoute = createCardRoute("/klienti/$id", true)
const groupCardRoute = createCardRoute("/skupiny/$id", false)
const applicationsRoute = createPrivateRoute(
    APP_URLS.zajemci.url,
    <Applications />,
    APP_URLS.zajemci.title,
)
const settingsRoute = createPrivateRoute(
    APP_URLS.nastaveni.url,
    <Settings />,
    APP_URLS.nastaveni.title,
)
const statisticsRoute = createPrivateRoute(
    APP_URLS.statistiky.url,
    <Statistics />,
    APP_URLS.statistiky.title,
)
const notFoundRoute = createPageRoute(
    APP_URLS.nenalezeno.url,
    <NotFound />,
    APP_URLS.nenalezeno.title,
)

const routeTree = rootRoute.addChildren([
    overviewRoute,
    loginRoute,
    groupsRoute,
    ...diaryRoutes,
    clientsRoute,
    clientCardRoute,
    groupCardRoute,
    applicationsRoute,
    settingsRoute,
    statisticsRoute,
    notFoundRoute,
])

const router = createRouter({
    routeTree,
    defaultPendingComponent: () => <PageSkeleton />,
    defaultPendingMs: 0,
})
export { router }
