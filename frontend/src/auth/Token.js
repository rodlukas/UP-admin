import decode from "jwt-decode"
import { prettyDateTime } from "../global/funcDateTime"

/** Klíč pro uložení tokenu do LocalStorage. */
const AUTH_STORAGE_KEY = "jwt"

/** Třída umožňující práci s tokenem v aplikaci. */
export default class Token {
    static remove() {
        localStorage.clear()
    }

    static save(token) {
        localStorage.setItem(AUTH_STORAGE_KEY, token)
    }

    static get() {
        return localStorage.getItem(AUTH_STORAGE_KEY)
    }

    static decodeToken(token) {
        return decode(token)
    }

    static logToConsole(token, decoded, dif) {
        console.log(
            "%c" +
                "token:\t" +
                token +
                "\ncas:\t" +
                prettyDateTime(new Date()) +
                "\nvyprsi:\t" +
                prettyDateTime(new Date(decoded.exp * 1000)) +
                "\ndif:\t" +
                dif +
                " s (cca. " +
                Math.round(dif / 60) +
                " min; cca. " +
                Math.round(dif / 3600) +
                " h)",
            "color: olive"
        )
    }
}
