import { useContext, useEffect } from "react"
import { AuthContext } from "./AuthContext"

/** Interval pro dotazování na platnost tokenu (případně se obnoví jeho platnost). */
const REFRESH_TOKEN_INTERVAL = 210 * 60 * 1000 // milisekundy -> 3.5 hodiny

/**
 * Komponenta pro automatickou opakovanou kontrolu přihlášení a platnosti tokenu.
 * V pravidelném intervalu ověří platnost tokenu a pokud se blíží ke konci, obnoví ho.
 */
const AuthChecking = () => {
    // destructuring kvuli useEffect deps (viz https://github.com/rodlukas/UP-admin/issues/96)
    const {
        IS_AUTH: authContext_IS_AUTH,
        isAuthenticated: authContext_isAuthenticated
    } = useContext(AuthContext)

    useEffect(() => {
        authContext_isAuthenticated()
        const intervalId = setInterval(authContext_isAuthenticated, REFRESH_TOKEN_INTERVAL)

        return () => clearInterval(intervalId)
    }, [authContext_IS_AUTH, authContext_isAuthenticated])

    return null
}

export default AuthChecking
