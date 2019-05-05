import React from "react"
import {Redirect} from "react-router-dom"
import APP_URLS from "../urls"
import {AttendanceStatesProvider} from "../contexts/AttendanceStateContext"
import {AuthConsumer} from "./AuthContext"
import Page from "../components/Page"

const PrivateRoute = ({component: WrappedComponent, ...rest}) =>
    <AuthConsumer>
        {authContext =>
        <Page {...rest} render={props =>
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
        />}
    </AuthConsumer>

export default PrivateRoute
