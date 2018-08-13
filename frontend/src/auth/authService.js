import decode from "jwt-decode"
import LoginService from "../api/services/login"
import {prettyDateTime} from "../global/funcDateTime"

const AUTH_REFRESH_THRESHOLD = 60 * 65 // sekundy -> 65 minut (60*65)
const AUTH_STORAGE_KEY = "jwt"

export default class AuthService {
    static isAuthenticated(refreshExpiringToken = true) {
        const token = Token.get()
        return !!token && !AuthService.isTokenExpired(token, refreshExpiringToken)
    }

    // prevod na sekundy (decoded.exp je v sekundach)
    static getCurrentDate() {
        return (Date.now() / 1000)
    }

    static isTokenExpired(token, refreshExpiringToken) {
        try {
            let decodedToken = decode(token)
            if (refreshExpiringToken) {
                const dif = decodedToken.exp - AuthService.getCurrentDate()
                Token.logToConsole(token, decodedToken, dif)
                if (dif > 0 && dif <= AUTH_REFRESH_THRESHOLD) {
                    Token.refresh(token)
                    // TODO return kontroly expirace fresh tokenu
                    console.log("token se obnovuje")
                    //decodedToken = decode(newToken)
                    //Token.logToConsole(newToken, decodedToken, decodedToken.exp - AuthService.getCurrentDate(), "pink")
                }
            }
            return decodedToken.exp < AuthService.getCurrentDate()
        }
        catch (err) {
            console.error(err)
            return true
        }
    }

    static login(username, password, callback) {
        const data = {username, password}
        LoginService.authenticate(data)
            .then(({token}) => {
                Token.save(token)
                callback()
            })
    }

    static logout(callback) {
        Token.remove()
        callback()
    }

    static getToken() {
        return Token.get()
    }
}

class Token {
    static refresh(token) {
        const data = {token}
        LoginService.refresh(data)
            .then(({token}) => Token.save(token))
            .catch(() => alert("CHYBA - neúspěšný pokus o obnovení vašeho přihlášení. Přihlašte se, prosím, znovu!"))
    }

    static remove() {
        localStorage.clear()
    }

    static save(token) {
        localStorage.setItem(AUTH_STORAGE_KEY, token)
    }

    static get() {
        return localStorage.getItem(AUTH_STORAGE_KEY)
    }

    static logToConsole(token, decoded, dif, color = "olive") {
        console.log("%c" +
            "token:\t" + token +
            "\ncas:\t" + prettyDateTime(new Date()) +
            "\nvyprsi:\t" + prettyDateTime(new Date(decoded.exp * 1000)) +
            "\ndif:\t" + dif + " s (~" + Math.round(dif / 60) + " min; ~" + Math.round(dif / 3600) + " h)",
            "color: " + color)
    }
}
