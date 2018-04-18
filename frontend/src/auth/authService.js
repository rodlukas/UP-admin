import decode from 'jwt-decode'
import LoginService from "../api/services/login"

const AUTH_REFRESH_THRESHOLD = 60*60 // sekundy
const AUTH_STORAGE_KEY = "jwt"

export default class AuthService {
    static isAuthenticated(fastCheck = false) { // fastCheck=True pokud komponenta ma rychle zjistit platnost tokenu bez zadosti o refresh
        const token = this.getToken()
        return !!token && !this.isTokenExpired(token, fastCheck)
    }

    static getCurrentDate() { // prevod na sekundy (decoded.exp je v sekundach)
        return (Date.now() / 1000)
    }

    static isTokenExpired(token, fastCheck) {
        try {
            const decoded = decode(token)
            if (!fastCheck) { //popis fastCheck v metode isAuthenticated
                const dif = decoded.exp - AuthService.getCurrentDate()
                console.log("%c --------\ntoken:\t" + token + '\naktual:\t' + new Date().toISOString() + "\nvyprsi:\t" + new Date(decoded.exp * 1000).toISOString() + "\ndif:\t" + dif, 'color: olive')
                if (dif > 0 && dif <= AUTH_REFRESH_THRESHOLD) {
                    this.refreshToken(token)
                    return (decode(this.getToken()).exp < this.getCurrentDate()) // dekoduj novy token a porovnej
                }
            }
            return decoded.exp < this.getCurrentDate()
        }
        catch (err) {
            return false
        }
    }

    static refreshToken(token) {
        const data = {token}
        LoginService.refresh(data)
            .then((response) => {
                this.saveToken(response.token)
            })
            .catch(() => {
                alert("CHYBA - neúspěšný pokus o obnovení vašeho přihlášení. Přihlašte se, prosím, znovu!")
            })
    }

    static authenticate(username, password, callback) {
        const data = {username, password}
        LoginService.authenticate(data)
            .then((response) => {
                this.saveToken(response.token)
                callback()
            })
    }

    static signout(callback) {
        localStorage.clear()
        callback()
    }

    static saveToken(token) {
        localStorage.setItem(AUTH_STORAGE_KEY, token)
    }

    static getToken() {
        return localStorage.getItem(AUTH_STORAGE_KEY)
    }
}
