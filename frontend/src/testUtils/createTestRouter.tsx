import {
    createMemoryHistory,
    createRootRoute,
    createRoute,
    createRouter,
    Outlet,
} from "@tanstack/react-router"
import * as React from "react"

type Options = {
    path?: string
    /** Další cesty, na které se dá v testu odnavigovat. Samy nic nevykreslují. */
    paths?: string[]
}

export async function createTestRouter(ui: React.ReactElement, options: Options = {}) {
    const path = options.path ?? "/"
    const rootRoute = createRootRoute({
        component: () => <Outlet />,
    })
    const indexRoute = createRoute({
        getParentRoute: () => rootRoute,
        path: "/",
        component: () => ui,
    })
    // vykreslují totéž co index: testované UI bývá v aplikaci součástí layoutu, takže
    // navigaci přežije — kdyby tu cíle vykreslovaly prázdno, odnavigování by ho odmountovalo
    const extraRoutes = (options.paths ?? []).map((extraPath) =>
        createRoute({
            getParentRoute: () => rootRoute,
            path: extraPath,
            component: () => ui,
        }),
    )
    const routeTree = rootRoute.addChildren([indexRoute, ...extraRoutes])
    const router = createRouter({
        routeTree,
        history: createMemoryHistory({
            initialEntries: [path],
        }),
    })
    await router.load()
    return router
}
