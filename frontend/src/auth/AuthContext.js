import decode from "jwt-decode"
import React, { Component, createContext } from "react"
import LoginService from "../api/services/login"
import { prettyDateTime } from "../global/funcDateTime"
import history from "../global/history"
import APP_URLS from "../urls"

const AUTH_REFRESH_THRESHOLD = 60 * 65 // sekundy -> 65 minut (60*65)
const AUTH_STORAGE_KEY = "jwt"

const AuthContext = createContext({
    logout: () => {},
    isAuthenticated: () => {},
    IS_LOADING: false,
    IS_AUTH: false
})

class AuthProvider extends Component {
    state = {
        IS_LOADING: false,
        IS_AUTH: false
    }

    componentDidMount() {
        this.isAuthenticated(false)
    }

    // prevod na sekundy (decoded.exp je v sekundach)
    static getCurrentDate() {
        return Date.now() / 1000
    }

    logout = () => {
        Token.remove()
        this.isAuthenticated(false)
        // z jakekoliv stranky presmeruj uzivatele na prihlaseni (napr. na strance nenalezeno ho to jinak ponecha i po odhlaseni
        history.push(APP_URLS.prihlasit.url)
    }

    isAuthenticated = (refreshExpiringToken = true) => {
        const token = Token.get()
        this.setState({
            IS_AUTH: token && !this.isTokenExpired(token, refreshExpiringToken)
        })
    }

    isTokenExpired = (token, refreshExpiringToken) => {
        try {
            let decodedToken = Token.decodeToken(token)
            if (refreshExpiringToken) {
                const dif = decodedToken.exp - AuthProvider.getCurrentDate()
                Token.logToConsole(token, decodedToken, dif)
                if (dif > 0 && dif <= AUTH_REFRESH_THRESHOLD) {
                    // token jeste plati, ale prodluz jeho platnost
                    this.refreshToken(token)
                }
            }
            // je zaslany token expirovany? (pokud byl odeslan pozadavek na prodlouzeni platnosti, bere se i tak platnost puvodniho tokenu)
            return decodedToken.exp < AuthProvider.getCurrentDate()
        } catch (err) {
            console.error(err)
            return true
        }
    }

    refreshToken = token => {
        const data = { token }
        return LoginService.refresh(data)
            .then(({ token }) => {
                Token.save(token)
                this.isAuthenticated(false)
            })
            .catch(() => {
                this.isAuthenticated(false)
                alert(
                    "CHYBA - neúspěšný pokus o obnovení vašeho přihlášení. Přihlašte se, prosím, znovu!"
                )
            })
    }

    login = credentials => {
        this.setAuthLoading(true)
        LoginService.authenticate(credentials)
            .then(({ token }) => {
                Token.save(token)
                this.setAuthLoading(false)
            })
            .catch(() => this.setAuthLoading(false))
    }

    setAuthLoading = newLoading => this.setState({ IS_LOADING: newLoading })

    componentDidUpdate(prevProps, prevState) {
        if (prevState.IS_LOADING && !this.state.IS_LOADING) {
            this.isAuthenticated(false)
        }
    }

    render = () => (
        <AuthContext.Provider
            value={{
                IS_AUTH: this.state.IS_AUTH,
                IS_LOADING: this.state.IS_LOADING,
                isAuthenticated: this.isAuthenticated,
                logout: this.logout,
                login: this.login
            }}>
            {this.props.children}
        </AuthContext.Provider>
    )
}

class Token {
    static remove() {
        localStorage.clear()
    }

    static save(token) {
        localStorage.setItem(AUTH_STORAGE_KEY, token)
    }

    static get() {
        return localStorage.getItem(AUTH_STORAGE_KEY)
    }

    static decodeToken(token) {
        return decode(token)
    }

    static logToConsole(token, decoded, dif) {
        console.log(
            "%c" +
                "token:\t" +
                token +
                "\ncas:\t" +
                prettyDateTime(new Date()) +
                "\nvyprsi:\t" +
                prettyDateTime(new Date(decoded.exp * 1000)) +
                "\ndif:\t" +
                dif +
                " s (cca. " +
                Math.round(dif / 60) +
                " min; cca. " +
                Math.round(dif / 3600) +
                " h)",
            "color: olive"
        )
    }
}

export { Token, AuthProvider, AuthContext }
