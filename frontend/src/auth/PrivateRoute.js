import React, {useContext} from "react"
import {Redirect} from "react-router-dom"
import APP_URLS from "../urls"
import {AuthContext} from "../auth/AuthContext"
import {AttendanceStatesProvider} from "../contexts/AttendanceStateContext"
import Page from "../components/Page"

const PrivateRoute = ({component: WrappedComponent, ...rest}) => {
    const authContext = useContext(AuthContext)

    return <Page {...rest} render={props =>
        authContext.IS_AUTH
            ?
            <AttendanceStatesProvider>
                <WrappedComponent {...props}/>
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
