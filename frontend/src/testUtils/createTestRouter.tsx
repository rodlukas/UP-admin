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
    const routeTree = rootRoute.addChildren([indexRoute])
    const router = createRouter({
        routeTree,
        history: createMemoryHistory({
            initialEntries: [path],
        }),
    })
    await router.load()
    return router
}
