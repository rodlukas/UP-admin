import axios from "axios"
import decode from 'jwt-decode'
import {API_URL} from "../global/GlobalConstants"

const AUTH_REFRESH_THRESHOLD = 60
const AUTH_STORAGE_KEY = "jwt"

export default class AuthService {
    static isAuthenticated(fastCheck = false) {// fastCheck=True pokud komponenta ma rychle zjistit platnost tokenu bez zadosti o refresh
        const token = this.getToken()
        return !!token && !this.isTokenExpired(token, fastCheck)
    }

    static getCurrentDate() {
        return (Date.now() / 1000) // prevod na sekundy (decoded.exp je v sekundach)
    }

    static isTokenExpired(token, fastCheck) {
        try {
            const decoded = decode(token)
            if (!fastCheck) {//popis fastCheck v metode isAuthenticated
                const dif = decoded.exp - AuthService.getCurrentDate()
                //console.log("--------\ntoken:\t" + token + '\naktual:\t' + new Date().toISOString() + "\nvyprsi:\t" + new Date(decoded.exp * 1000).toISOString() + "\ndif:\t" + dif)
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
        axios.post(API_URL + 'jwt-refresh/', {token})
            .then((response) => {
                this.saveToken(response.data.token)
            })
            .catch((error) => {
                console.log(error)
                alert("CHYBA - neúspěšný pokus o obnovení vašeho přihlášení. Přihlašte se, prosím, znovu!")
                this.props.history.push("/prihlasit")
            })
    }

    static authenticate(username, password, callback) {
        axios.post(API_URL + 'jwt-auth/', {username, password})
            .then((response) => {
                this.saveToken(response.data.token)
                callback()
            })
            .catch((error) => {
                console.log(error)
                alert("Špatné jméno nebo heslo!")
                this.props.history.push("/prihlasit")
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

    static getHeaders() { // prida jwt token a csrf token
        return {
            xsrfCookieName: 'csrftoken',
            xsrfHeaderName: 'X-CSRFToken',
            headers: {Authorization: 'JWT ' + this.getToken()}}
    }
}
