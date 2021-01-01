import * as React from "react"
import { Redirect } from "react-router-dom"

import APP_URLS from "../APP_URLS"
import Page from "../components/Page"
import { AttendanceStatesProvider } from "../contexts/AttendanceStatesContext"
import { CoursesVisibleProvider } from "../contexts/CoursesVisibleContext"
import { CustomRouteProps } from "../types/types"

import { useAuthContext } from "./AuthContext"

/**
 * Komponenta, která rozlišuje ne/přihlášeného uživatele.
 * Na základě toho mu zobrazí příslušný obsah, případně přesměruje na přihlášení.
 */
const PrivateRoute: React.FC<CustomRouteProps> = ({ component: WrappedComponent, ...rest }) => {
    const authContext = useAuthContext()

    if (!WrappedComponent) {
        return null
    }

    return (
        <Page
            {...rest}
            render={(props): React.ReactNode =>
                authContext.isAuth ? (
                    <AttendanceStatesProvider>
                        <CoursesVisibleProvider>
                            <WrappedComponent {...props} />
                        </CoursesVisibleProvider>
                    </AttendanceStatesProvider>
                ) : (
                    <Redirect
                        to={{
                            pathname: APP_URLS.prihlasit.url,
                            state: { from: props.location },
                        }}
                    />
                )
            }
        />
    )
}

export default PrivateRoute
