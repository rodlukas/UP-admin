import React from "react"
import {Route, Redirect} from "react-router-dom"
import APP_URLS from "../urls"
import {AttendanceStatesProvider} from "../contexts/AttendanceStateContext"
import {AuthConsumer} from "./AuthContext"

const PrivateRoute = ({component: Component, ...rest}) =>
    <AuthConsumer>
        {authContext =>
        <Route {...rest} render={props =>
            authContext.IS_AUTH
                ?
                <AttendanceStatesProvider>
                    <Component {...props}/>
                </AttendanceStatesProvider>
                :
                <Redirect to={{
                    pathname: APP_URLS.prihlasit,
                    state: {from: props.location}
                }}
                />}
        />}
    </AuthConsumer>

export default PrivateRoute
