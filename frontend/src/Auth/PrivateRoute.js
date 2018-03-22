import React from "react"
import AuthService from "./AuthService"
import {Route, Redirect} from "react-router-dom"

const PrivateRoute = ({component: Component, ...rest}) => (
    <Route
        {...rest}
        render={props =>
            AuthService.isAuthenticated() ? (
                <Component {...props}/>
            ) : (
                <Redirect
                    to={{
                        pathname: "/prihlasit",
                        state: {from: props.location}
                    }}
                />)}
    />
)

export default PrivateRoute
