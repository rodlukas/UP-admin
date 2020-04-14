import * as React from "react"
import LoginService from "../api/services/LoginService"
import APP_URLS from "../APP_URLS"
import history from "../global/history"
import { noop } from "../global/utils"
import { AuthorizationType, TokenCodedType } from "../types/models"
import { fEmptyVoid } from "../types/types"
import Token from "./Token"

/** Hodnota zbývající platnosti tokenu, při které dojde k požadavku na jeho obnovení. */
const AUTH_REFRESH_THRESHOLD = 60 * 65 // sekundy -> 65 minut

type State = {
    /** Probíhá načítání (true). */
    isLoading: boolean
    /** Uživatel je přihlášen (true). */
    isAuth: boolean
}

type Context = State & {
    /** Funkce pro přihlášení uživatele. */
    login: (credentials: AuthorizationType) => void
    /** Funkce pro odhlášení uživatele. */
    logout: fEmptyVoid
    /** Funkce pro zjištění, zda je uživatel přihlášen (případně obnoví token s blížící se expirací). */
    isAuthenticated: (refreshExpiringToken?: boolean) => void
}

/** Context pro správu přihlášení uživatele. */
const AuthContext = React.createContext<Context>({
    isLoading: false,
    isAuth: false,
    isAuthenticated: noop,
    login: noop,
    logout: noop,
})

type Props = {}

class AuthProvider extends React.Component<Props, State> {
    state: State = {
        isLoading: false,
        isAuth: false,
    }

    componentDidMount(): void {
        this.isAuthenticated(false)
    }

    // prevod na sekundy (decoded.exp je v sekundach)
    static getCurrentDate(): number {
        return Date.now() / 1000
    }

    logout = (): void => {
        Token.remove()
        this.isAuthenticated(false)
        // z jakekoliv stranky presmeruj uzivatele na prihlaseni (napr. na strance nenalezeno ho to jinak ponecha i po
        // odhlaseni
        history.push(APP_URLS.prihlasit.url)
    }

    isAuthenticated = (refreshExpiringToken = true): void => {
        const token = Token.get()
        this.setState({
            isAuth: token !== null && !this.isTokenExpired(token, refreshExpiringToken),
        })
    }

    isTokenExpired = (token: TokenCodedType, refreshExpiringToken: boolean): boolean => {
        try {
            const decodedToken = Token.decodeToken(token)
            if (refreshExpiringToken) {
                const dif = decodedToken.exp - AuthProvider.getCurrentDate()
                Token.logToConsole(token, decodedToken, dif)
                if (dif > 0 && dif <= AUTH_REFRESH_THRESHOLD) {
                    // token jeste plati, ale prodluz jeho platnost
                    this.refreshToken(token)
                }
            }
            // je zaslany token expirovany? (pokud byl odeslan pozadavek na prodlouzeni platnosti, bere se i tak
            // platnost puvodniho tokenu)
            return decodedToken.exp < AuthProvider.getCurrentDate()
        } catch (err) {
            console.error(err)
            return true
        }
    }

    refreshToken = (oldToken: TokenCodedType): void => {
        const data = { token: oldToken }
        LoginService.refresh(data)
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

    login = (credentials: AuthorizationType): void => {
        this.setAuthLoading(true)
        LoginService.authenticate(credentials)
            .then(({ token }) => {
                Token.save(token)
                this.setAuthLoading(false)
            })
            .catch(() => this.setAuthLoading(false))
    }

    setAuthLoading = (newLoading: boolean): void => this.setState({ isLoading: newLoading })

    componentDidUpdate(_prevProps: Props, prevState: State): void {
        if (prevState.isLoading && !this.state.isLoading) {
            this.isAuthenticated(false)
        }
    }

    render = (): React.ReactNode => (
        <AuthContext.Provider
            value={{
                isAuth: this.state.isAuth,
                isLoading: this.state.isLoading,
                isAuthenticated: this.isAuthenticated,
                logout: this.logout,
                login: this.login,
            }}>
            {this.props.children}
        </AuthContext.Provider>
    )
}

export { AuthProvider, AuthContext }
