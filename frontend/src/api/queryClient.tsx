import { MutationCache, QueryClient } from "@tanstack/react-query"
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
                {Object.keys(djangoError).map((field) => (
                    <li key={field}>
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

    logErrorToConsole(axiosError, djangoError)

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

/** Vytvoří QueryClient s globálním error handlingem a automatickou invalidací. */
export function createQueryClient(): QueryClient {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: 1,
                refetchOnWindowFocus: false,
                onError: (error: unknown) => {
                    handleError(error as AxiosError)
                },
            },
            mutations: {
                onError: (error: unknown) => {
                    handleError(error as AxiosError)
                },
            },
        },
        mutationCache: new MutationCache({
            onSuccess: (_data, _variables, _context, mutation) => {
                // Invalidujeme všechny queries po každé úspěšné mutaci.
                // Invalidace pouze refetchuje aktivní queries a označí ostatní jako stale,
                // takže se refetchují až když budou potřeba.
                // Viz: https://tkdodo.eu/blog/automatic-query-invalidation-after-mutations
                void queryClient.invalidateQueries()

                // Notifikace potlačíme, pokud je v meta nastaveno skipSuccessNotification
                if (mutation.options.meta?.skipSuccessNotification) {
                    return
                }

                // Získáme success zprávu z mutation meta, pokud je k dispozici
                const successMessage = mutation.options.meta?.successMessage as string | undefined

                toast(<Notification type={toast.TYPE.SUCCESS} text={successMessage} />, {
                    type: toast.TYPE.SUCCESS,
                    autoClose: 4000,
                })
            },
        }),
    })

    return queryClient
}
