import React from "react"
import {Route, Redirect} from "react-router-dom"
import APP_URLS from "../urls"
import {MyProvider} from "../Context"
import {AuthConsumer} from "./AuthContext"

const PrivateRoute = ({component: Component, ...rest}) =>
    <AuthConsumer>
        {authContext =>
        <Route {...rest} render={props =>
            authContext.IS_AUTH
                ?
                <MyProvider>
                    <Component {...props}/>
                </MyProvider>
                :
                <Redirect to={{
                    pathname: APP_URLS.prihlasit,
                    state: {from: props.location}
                }}
                />}
        />}
    </AuthConsumer>

export default PrivateRoute
