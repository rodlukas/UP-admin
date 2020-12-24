import jwt_decode from "jwt-decode"

import { prettyDateTime } from "../global/funcDateTime"
import { TokenCodedType, TokenDecodedType } from "../types/models"

/** Klíč pro uložení tokenu do LocalStorage. */
const AUTH_STORAGE_KEY = "jwt"

/** Třída umožňující práci s tokenem v aplikaci. */
export default class Token {
    static remove(): void {
        localStorage.clear()
    }

    static save(token: TokenCodedType): void {
        localStorage.setItem(AUTH_STORAGE_KEY, token)
    }

    static get(): TokenCodedType | null {
        return localStorage.getItem(AUTH_STORAGE_KEY)
    }

    static getEmpty(): TokenDecodedType {
        return {
            email: "",
            username: "",
            exp: 0,
        }
    }

    static decodeToken(token: TokenCodedType): TokenDecodedType {
        return jwt_decode(token)
    }

    static logToConsole(token: TokenCodedType, decoded: TokenDecodedType, dif: number): void {
        console.info(
            `%ctoken:\t${token}\ncas:\t${prettyDateTime(new Date())}\nvyprsi:\t${prettyDateTime(
                new Date(decoded.exp * 1000)
            )}\ndif:\t${dif} s (cca. ${Math.round(dif / 60)} min; cca. ${Math.round(
                dif / 3600
            )} h)`,
            "color: olive"
        )
    }
}
