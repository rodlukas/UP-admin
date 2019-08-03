import React, {useContext} from "react"
import {Redirect} from "react-router-dom"
import {AuthContext} from "../auth/AuthContext"
import Page from "../components/Page"
import {AttendanceStatesProvider} from "../contexts/AttendanceStatesContext"
import {ClientsActiveProvider} from "../contexts/ClientsActiveContext"
import {CoursesVisibleProvider} from "../contexts/CoursesVisibleContext"
import APP_URLS from "../urls"

const PrivateRoute = ({component: WrappedComponent, ...rest}) => {
    const authContext = useContext(AuthContext)

    return <Page {...rest} render={props =>
        authContext.IS_AUTH
            ?
            <AttendanceStatesProvider>
                <CoursesVisibleProvider>
                    <ClientsActiveProvider>
                        <WrappedComponent {...props}/>
                    </ClientsActiveProvider>
                </CoursesVisibleProvider>
            </AttendanceStatesProvider>
            :
            <Redirect to={{
                pathname: APP_URLS.prihlasit.url,
                state: {from: props.location}
            }}
            />}
    />
}

export default PrivateRoute
