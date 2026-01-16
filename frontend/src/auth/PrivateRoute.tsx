import * as React from "react"
import { Navigate, useLocation } from "react-router-dom"

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
    const location = useLocation()

    if (!authContext.isAuth) {
        return <Navigate to={APP_URLS.prihlasit.url} state={{ from: location }} replace />
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
