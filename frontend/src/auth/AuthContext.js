import React, {Component, createContext} from "react"
import AuthService from "./authService"

const AuthContext = createContext({
    logout: () => {},
    setAuthLoading: () => {},
    IS_LOADING: false,
    IS_AUTH: false
})

class AuthProvider extends Component {
    state = {
        IS_AUTH: AuthService.isAuthenticated(false),
        IS_LOADING: false
    }

    logout = () => {
        this.setState({IS_AUTH: AuthService.isAuthenticated(false)})
    }

    setAuthLoading = (newLoading) => {
        this.setState({IS_LOADING: newLoading})
    }

    componentDidUpdate(prevProps, prevState) {
        if(prevState.IS_LOADING && !this.state.IS_LOADING)
            this.setState({IS_AUTH: AuthService.isAuthenticated(false)})
    }

    render = () =>
        <AuthContext.Provider
            value={{
                IS_AUTH: this.state.IS_AUTH,
                IS_LOADING: this.state.IS_LOADING,
                setAuthLoading: (newLoading) => this.setAuthLoading(newLoading),
                logout: this.logout
            }}>
            {this.props.children}
        </AuthContext.Provider>
}

const WithAuthContext = (Component) => {
    return (props) => (
        <AuthContext.Consumer>
            {authContext => <Component {...props} authContext={authContext}/>}
        </AuthContext.Consumer>
    )
}

const AuthConsumer = AuthContext.Consumer

export {AuthConsumer, AuthProvider, WithAuthContext}
