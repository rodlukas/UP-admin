import React from "react"
import AuthService from "./AuthService"
import {Route, Redirect} from "react-router-dom"

const PrivateRoute = ({component: Component, notify, ...rest}) => (
    <Route
        {...rest}
        render={props =>
            AuthService.isAuthenticated() ? (
                <Component notify={notify} {...props}/>
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
