import * as React from "react"
import { AuthContext } from "./AuthContext"

/** Interval pro dotazování na platnost tokenu (případně se obnoví jeho platnost). */
const REFRESH_TOKEN_INTERVAL = 210 * 60 * 1000 // milisekundy -> 3.5 hodiny

/**
 * Komponenta pro automatickou opakovanou kontrolu přihlášení a platnosti tokenu.
 * V pravidelném intervalu ověří platnost tokenu a pokud se blíží ke konci, obnoví ho.
 */
const AuthChecking: React.FC = () => {
    // destructuring kvuli useEffect deps (viz https://github.com/rodlukas/UP-admin/issues/96)
    const {
        isAuth: authContextIsAuth,
        isAuthenticated: authContextIsAuthenticated
    } = React.useContext(AuthContext)

    React.useEffect(() => {
        authContextIsAuthenticated()
        const intervalId = window.setInterval(authContextIsAuthenticated, REFRESH_TOKEN_INTERVAL)

        return (): void => window.clearInterval(intervalId)
    }, [authContextIsAuth, authContextIsAuthenticated])

    return null
}

export default AuthChecking
