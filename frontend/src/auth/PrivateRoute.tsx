import { Navigate, useRouterState } from "@tanstack/react-router"
import * as React from "react"

import APP_URLS from "../APP_URLS"
import Page from "../components/Page"
import { AttendanceStatesProvider } from "../contexts/AttendanceStatesContext"
import { CoursesVisibleProvider } from "../contexts/CoursesVisibleContext"

import { useAuthContext } from "./AuthContext"

/**
 * Komponenta, která rozlišuje ne/přihlášeného uživatele.
 * Na základě toho mu zobrazí příslušný obsah, případně přesměruje na přihlášení.
 */
type PrivateRouteProps = {
    title?: string
    children: React.ReactElement
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ title, children }) => {
    const authContext = useAuthContext()
    const locationPathname = useRouterState({
        select: (state) => state.location.pathname,
    })

    if (!authContext.isAuth) {
        return (
            <Navigate
                to={APP_URLS.prihlasit.url}
                search={{ redirect: locationPathname }}
                replace
            />
        )
    }

    return (
        <Page title={title}>
            <AttendanceStatesProvider>
                <CoursesVisibleProvider>{children}</CoursesVisibleProvider>
            </AttendanceStatesProvider>
        </Page>
    )
}

export default PrivateRoute
