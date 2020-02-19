import React, { useContext } from "react"
import { Redirect } from "react-router-dom"
import { AuthContext } from "../auth/AuthContext"
import Page from "../components/Page"
import { AttendanceStatesProvider } from "../contexts/AttendanceStatesContext"
import { CoursesVisibleProvider } from "../contexts/CoursesVisibleContext"
import { GroupsActiveProvider } from "../contexts/GroupsActiveContext"
import APP_URLS from "../urls"

/**
 * Komponenta, která rozlišuje ne/přihlášeného uživatele.
 * Na základě toho mu zobrazí příslušný obsah, případně přesměruje na přihlášení.
 */
const PrivateRoute = ({ component: WrappedComponent, ...rest }) => {
    const authContext = useContext(AuthContext)

    return (
        <Page
            {...rest}
            render={props =>
                authContext.IS_AUTH ? (
                    <AttendanceStatesProvider>
                        <CoursesVisibleProvider>
                            <GroupsActiveProvider>
                                <WrappedComponent {...props} />
                            </GroupsActiveProvider>
                        </CoursesVisibleProvider>
                    </AttendanceStatesProvider>
                ) : (
                    <Redirect
                        to={{
                            pathname: APP_URLS.prihlasit.url,
                            state: { from: props.location }
                        }}
                    />
                )
            }
        />
    )
}

export default PrivateRoute
