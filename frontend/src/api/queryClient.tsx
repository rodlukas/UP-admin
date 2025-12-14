import { QueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"
import * as React from "react"
import { toast, ToastOptions } from "react-toastify"

import APP_URLS from "../APP_URLS"
import Token from "../auth/Token"
import Notification from "../components/Notification"
import { NOTIFY_TEXT } from "../global/constants"
import history from "../global/history"

import { parseDjangoError } from "./parseDjangoError"

/**
 * Vrátí chybovou zprávu pro zobrazení.
 */
function getErrorMessage(
    errorResponse: AxiosError["response"],
    djangoError: null | Record<string, any> | string,
): React.ReactElement | string {
    // stalo se neco jineho pri priprave requestu
    if (!errorResponse) {
        return "Při přípravě requestu nastala chyba"
    }

    // request proveden, ale neprislo 2xx
    if (errorResponse.status === 503) {
        return NOTIFY_TEXT.ERROR_TIMEOUT
    }

    // uloz do errMsg neco konkretnejsiho
    if (typeof djangoError === "string") {
        return djangoError
    }

    if (djangoError && typeof djangoError === "object") {
        return (
            <ul>
                {Object.keys(djangoError).map((field, index) => (
                    <li key={`err${index}`}>
                        <span className="font-weight-bold">{field}: </span>
                        <span className="font-italic">{String(djangoError[field])}</span>
                    </li>
                ))}
            </ul>
        )
    }

    return NOTIFY_TEXT.ERROR
}

/**
 * Loguje chybu do konzole.
 */
function logErrorToConsole(
    axiosError: AxiosError,
    djangoError: null | Record<string, any> | string,
): void {
    console.error("Požadavek byl NEÚSPĚŠNÝ: ", axiosError.config)
    const errorResponse = axiosError.response

    // request proveden, ale neprislo 2xx
    if (errorResponse) {
        // log do konzole
        console.error("Status: ", errorResponse.status, errorResponse.statusText)
        console.error("Data: ", errorResponse.data)
        console.error("Headers: ", errorResponse.headers)
        console.error("DJANGO/DRF CHYBA: ", djangoError)
        console.error("DALŠÍ INFORMACE: ", axiosError)
    } else {
        // stalo se neco jineho pri priprave requestu
        console.error("Při přípravě requestu nastala chyba: ", axiosError.message)
    }
}

/**
 * Zpracuje chybu - zobrazí notifikaci a případně přesměruje uživatele.
 */
function handleError(axiosError: AxiosError): void {
    const errorResponse = axiosError.response
    const djangoError = parseDjangoError(axiosError)

    // Logování do konzole
    logErrorToConsole(axiosError, djangoError)

    // Zobrazení notifikace
    const errorMessage = getErrorMessage(errorResponse, djangoError)
    const toastOptions: ToastOptions = {
        type: toast.TYPE.ERROR,
        autoClose: 15000,
    }
    toast(<Notification text={errorMessage} type={toast.TYPE.ERROR} />, toastOptions)

    // Speciální zpracování pro určité status kódy
    if (errorResponse) {
        if (errorResponse.status === 401) {
            // !! Je potreba odstranit token - mohla totiz nastat situace, kdy server oznacil token jako
            // nevalidni, ale frontend jej povazuje za "validni" (ale jeho validitu samozrejme v realu
            // overit nemuze, resi jen expiraci) - pak by doslo k presmerovani na prihlaseni, to ale povazuje
            // uzivatele za stale prihlaseneho (token neexpiroval, povazuje jej za "validni") a presmerovava
            // zpatky na puvodni stranku, tedy dojde k zacykleni. Odstranenim tokenu neschopnost frontendu
            // korektne validovat token vyresime.
            Token.remove()
            history.push(APP_URLS.prihlasit.url)
        } else if (errorResponse.status === 404) {
            history.push(APP_URLS.nenalezeno.url)
        }
    }
}

/** Vytvoří QueryClient s globálním error handlingem. */
export function createQueryClient(): QueryClient {
    return new QueryClient({
        defaultOptions: {
            queries: {
                // Automaticky zruší requesty při unmount komponenty
                retry: 1,
                refetchOnWindowFocus: false,
                // Globální error handling pro queries
                onError: (error: unknown) => {
                    handleError(error as AxiosError)
                },
            },
            mutations: {
                // Globální error handling pro mutations
                onError: (error: unknown) => {
                    handleError(error as AxiosError)
                },
                // Zobrazit success notifikaci pro mutations
                // Používáme onSettled místo onSuccess, protože onSettled se volá vždy,
                // i když je definován lokální onSuccess v mutate() volání
                onSettled: (data, error) => {
                    // Zobrazit success notifikaci pouze pokud není chyba
                    if (!error && data !== undefined) {
                        toast(<Notification type={toast.TYPE.SUCCESS} />, {
                            type: toast.TYPE.SUCCESS,
                            autoClose: 4000,
                        })
                    }
                },
            },
        },
    })
}
