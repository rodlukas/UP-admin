import * as React from "react"
import { toast } from "react-toastify"

import LoginService from "../api/services/LoginService"
import APP_URLS from "../APP_URLS"
import Notification from "../components/Notification"
import history from "../global/history"
import { useContextWithProvider } from "../hooks/useContextWithProvider"
import { AuthorizationType } from "../types/models"
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

type AuthContextInterface = Context | undefined

/** Context pro správu přihlášení uživatele. */
const AuthContext = React.createContext<AuthContextInterface>(undefined)

// prevod na sekundy (decoded.exp je v sekundach)
const getCurrentDate = (): number => Date.now() / 1000

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isLoading, setIsLoading] = React.useState(false)
    const [isAuth, setIsAuth] = React.useState(false)

    const isAuthenticated = React.useCallback((refreshExpiringToken = true): void => {
        const token = Token.get()
        if (token === null) {
            setIsAuth(false)
            return
        }

        try {
            const decodedToken = Token.decodeToken(token)
            if (refreshExpiringToken) {
                const dif = decodedToken.exp - getCurrentDate()
                Token.logToConsole(token, decodedToken, dif)
                if (dif > 0 && dif <= AUTH_REFRESH_THRESHOLD) {
                    // token jeste plati, ale prodluz jeho platnost
                    const data = { token }
                    LoginService.refresh(data)
                        .then(({ token: newToken }) => {
                            Token.save(newToken)
                            setIsAuth(true)
                        })
                        .catch(() => {
                            setIsAuth(false)
                            toast(
                                <Notification
                                    type={toast.TYPE.WARNING}
                                    text="Neúspěšný pokus o obnovení vašeho přihlášení (pravděpodobně z důvodu delší neaktivity). Přihlašte se, prosím, znovu!"
                                />,
                                {
                                    type: toast.TYPE.WARNING,
                                },
                            )
                        })
                    return
                }
            }
            // je zaslany token expirovany? (pokud byl odeslan pozadavek na prodlouzeni platnosti, bere se i tak
            // platnost puvodniho tokenu)
            setIsAuth(decodedToken.exp >= getCurrentDate())
        } catch (err) {
            console.error(err)
            setIsAuth(false)
        }
    }, [])

    const login = React.useCallback((credentials: AuthorizationType): void => {
        setIsLoading(true)
        LoginService.authenticate(credentials)
            .then(({ token }) => {
                Token.save(token)
            })
            .catch(() => {
                // Chyba při přihlášení - uživatel uvidí notifikaci z globálního error handleru
            })
            .finally(() => {
                setIsLoading(false)
            })
    }, [])

    const logout = React.useCallback((): void => {
        Token.remove()
        isAuthenticated(false)
        // z jakekoliv stranky presmeruj uzivatele na prihlaseni (napr. na strance nenalezeno ho to jinak ponecha i po
        // odhlaseni
        history.push(APP_URLS.prihlasit.url)
    }, [isAuthenticated])

    React.useEffect(() => {
        isAuthenticated(false)
    }, [isAuthenticated])

    React.useEffect(() => {
        if (!isLoading) {
            isAuthenticated(false)
        }
    }, [isLoading, isAuthenticated])

    return (
        <AuthContext.Provider
            value={{
                isAuth,
                isLoading,
                isAuthenticated,
                logout,
                login,
            }}>
            {children}
        </AuthContext.Provider>
    )
}
export const useAuthContext = (): Context => useContextWithProvider(AuthContext)

export { AuthProvider, AuthContext }
