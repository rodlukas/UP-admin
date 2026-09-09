import { notifications } from "@mantine/notifications"
import { useNavigate } from "@tanstack/react-router"
import * as React from "react"

import { trackEvent } from "../analytics"
import { useLogin } from "../api/hooks"
import LoginService from "../api/services/LoginService"
import APP_URLS from "../APP_URLS"
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

/**
 * Počáteční `isAuth` synchronně z uloženého tokenu — stejná logika jako běžná větev
 * `isAuthenticated(false)` níže, jen spuštěná už při prvním renderu, ne až v efektu po
 * něm. `Token.get()`/`decodeToken()` nejsou async (localStorage, čisté dekódování JWT),
 * takže na to není důvod čekat na efekt.
 *
 * Bez tohohle viděl `PrivateRoute` (a `Main.tsx`) na úplně prvním renderu vždycky
 * `isAuth=false` (default `useState`), tedy i u platně přihlášeného uživatele — a než
 * stihl proběhnout efekt, co token doopravdy ověří, `PrivateRoute` už stačil přesměrovat
 * na `/prihlasit`. Při refreshi soukromé stránky se tak i přihlášenému uživateli na
 * okamžik mihla přihlašovací trasa (a s ní kostra přihlášení, `LoginSkeleton`), než ho
 * `Login.tsx` poslalo zpátky.
 */
function getInitialIsAuth(): boolean {
    const token = Token.get()
    if (token === null) {
        return false
    }
    try {
        return Token.decodeToken(token).exp >= getCurrentDate()
    } catch {
        return false
    }
}

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuth, setIsAuth] = React.useState(getInitialIsAuth)
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
                            notifications.show({
                                message:
                                    "Neúspěšný pokus o obnovení vašeho přihlášení (pravděpodobně z důvodu delší neaktivity). Přihlašte se, prosím, znovu!",
                                color: "yellow",
                                autoClose: false,
                            })
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
            trackEvent("login")
        },
        [loginMutation],
    )

    const logout = React.useCallback((): void => {
        Token.remove()
        void isAuthenticated(false)
        trackEvent("logout")
        // z jakekoliv stranky presmeruj uzivatele na prihlaseni (napr. na strance nenalezeno ho to jinak ponecha i po
        // odhlaseni
        void navigate({ to: APP_URLS.prihlasit.url })
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
