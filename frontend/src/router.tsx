import { createRootRoute, createRoute, createRouter } from "@tanstack/react-router"
import * as React from "react"

import { createQueryClient } from "./api/queryClient"
import AppLayout from "./App"
import APP_URLS from "./APP_URLS"
import PrivateRoute from "./auth/PrivateRoute"
import Loading from "./components/Loading"
import Page from "./components/Page"
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

let router: ReturnType<typeof createRouter>
const queryClient = createQueryClient(() => {
    if (!router) {
        return undefined
    }
    return (path: string) => {
        void router.navigate({ to: path })
    }
})

const rootRoute = createRootRoute({
    component: () => <AppLayout queryClient={queryClient} />,
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

const overviewRoute = createPrivateRoute(APP_URLS.prehled.url, <Dashboard />, APP_URLS.prehled.title)

const loginRoute = createChildRoute({
    path: APP_URLS.prihlasit.url,
    validateSearch: (search: Record<string, unknown>) => ({
        redirect: typeof search.redirect === "string" ? search.redirect : undefined,
    }),
    component: () => (
        <Page title={APP_URLS.prihlasit.title}>
            <Login />
        </Page>
    ),
})

const groupsRoute = createPrivateRoute(APP_URLS.skupiny.url, <Groups />, APP_URLS.skupiny.title)

const diaryRoutes = [
    APP_URLS.diar.url,
    `${APP_URLS.diar.url}/$year`,
    `${APP_URLS.diar.url}/$year/$month`,
    `${APP_URLS.diar.url}/$year/$month/$day`,
].map((path) => createPrivateRoute(path, <Diary />))

const clientsRoute = createPrivateRoute(APP_URLS.klienti.url, <Clients />, APP_URLS.klienti.title)
const clientCardRoute = createPrivateRoute("/klienti/$id", <Card />)
const groupCardRoute = createPrivateRoute("/skupiny/$id", <Card />)
const applicationsRoute = createPrivateRoute(
    APP_URLS.zajemci.url,
    <Applications />,
    APP_URLS.zajemci.title,
)
const settingsRoute = createPrivateRoute(APP_URLS.nastaveni.url, <Settings />, APP_URLS.nastaveni.title)
const notFoundRoute = createPageRoute(APP_URLS.nenalezeno.url, <NotFound />, APP_URLS.nenalezeno.title)
const catchAllRoute = createPageRoute("*", <NotFound />, APP_URLS.nenalezeno.title)

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
    notFoundRoute,
    catchAllRoute,
])

router = createRouter({
    routeTree,
    defaultPendingComponent: () => <Loading />,
    defaultPendingMs: 0,
})

export { router }
