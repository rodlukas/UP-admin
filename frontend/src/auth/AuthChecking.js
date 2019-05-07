import {useContext, useEffect} from "react"
import {AuthContext} from "./AuthContext"

// interval pro dotazovani na platnost tokenu (pripadne se obnovi jeho platnost)
const REFRESH_TOKEN_INTERVAL = 210 * 60 * 1000 // milisekundy -> 3.5 hodiny (210*60*1000)

const AuthChecking = () => {
    const authContext = useContext(AuthContext)

    useEffect(() => {
        const intervalId = setInterval(authContext.isAuthenticated, REFRESH_TOKEN_INTERVAL)

        return () => clearInterval(intervalId)
    }, [authContext])

    return null
}

export default AuthChecking
