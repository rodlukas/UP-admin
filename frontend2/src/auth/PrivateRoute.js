import React from "react"
import AuthService from "./authService"
import {Route, Redirect} from "react-router-dom"
import APP_URLS from "../urls"

const PrivateRoute = ({component: Component, ...rest}) => (
    <Route {...rest}
           render={props =>
            AuthService.isAuthenticated() ? (
                <Component {...props}/>
            ) : (
                <Redirect
                    to={{
                        pathname: APP_URLS.prihlasit,
                        state: {from: props.location}
                    }}
                />)}
    />
)

export default PrivateRoute
