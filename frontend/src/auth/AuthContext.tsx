import * as React from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"

import { useLogin } from "../api/hooks"
import LoginService from "../api/services/LoginService"
import APP_URLS from "../APP_URLS"
import Notification from "../components/Notification"
import { useContextWithProvider } from "../hooks/useContextWithProvider"
import { AuthorizationType } from "../types/models"
import { fEmptyVoid } from "../types/types"

import Token from "./Token"

/** Hodnota zbývající platnosti tokenu, při které dojde k požadavku na jeho obnovení. */
const AUTH_REFRESH_THRESHOLD = 60 * 65 // sekundy -> 65 minut

type Context = {
    /** Uživatel je přihlášen (true). */
    isAuth: boolean
    /** Probíhá načítání (true). */
    isLoading: boolean
    /** Funkce pro přihlášení uživatele. */
    login: (credentials: AuthorizationType) => Promise<void>
    /** Funkce pro odhlášení uživatele. */
    logout: fEmptyVoid
    /** Funkce pro zjištění, zda je uživatel přihlášen (případně obnoví token s blížící se expirací). */
    isAuthenticated: (refreshExpiringToken?: boolean) => Promise<void>
}

type AuthContextInterface = Context | undefined

/** Context pro správu přihlášení uživatele. */
const AuthContext = React.createContext<AuthContextInterface>(undefined)

// prevod na sekundy (decoded.exp je v sekundach)
const getCurrentDate = (): number => Date.now() / 1000

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuth, setIsAuth] = React.useState(false)
    const loginMutation = useLogin()
    const navigate = useNavigate()

    const isAuthenticated = React.useCallback(
        async (refreshExpiringToken = true): Promise<void> => {
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
                        try {
                            const data = { token }
                            const { token: newToken } = await LoginService.refresh(data)
                            Token.save(newToken)
                            setIsAuth(true)
                        } catch {
                            setIsAuth(false)
                            toast.warning(
                                <Notification text="Neúspěšný pokus o obnovení vašeho přihlášení (pravděpodobně z důvodu delší neaktivity). Přihlašte se, prosím, znovu!" />,
                            )
                        }
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
        },
        [],
    )

    const login = React.useCallback(
        async (credentials: AuthorizationType): Promise<void> => {
            await loginMutation.mutateAsync(credentials)
        },
        [loginMutation],
    )

    const logout = React.useCallback((): void => {
        Token.remove()
        void isAuthenticated(false)
        // z jakekoliv stranky presmeruj uzivatele na prihlaseni (napr. na strance nenalezeno ho to jinak ponecha i po
        // odhlaseni
        void navigate(APP_URLS.prihlasit.url)
    }, [isAuthenticated, navigate])

    React.useEffect(() => {
        void isAuthenticated(false)
    }, [isAuthenticated])

    React.useEffect(() => {
        if (!loginMutation.isPending) {
            void isAuthenticated(false)
        }
    }, [loginMutation.isPending, isAuthenticated])

    return (
        <AuthContext.Provider
            value={{
                isAuth,
                isLoading: loginMutation.isPending,
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
