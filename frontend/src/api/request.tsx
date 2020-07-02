import { AxiosError, AxiosPromise, AxiosRequestConfig, AxiosResponse } from "axios"
import * as React from "react"
import { toast, ToastOptions, TypeOptions as ToastTypeOptions } from "react-toastify"
import APP_URLS from "../APP_URLS"
import Token from "../auth/Token"
import Notification from "../components/Notification"
import { NOTIFY_TEXT } from "../global/constants"
import history from "../global/history"
import { ErrMsg } from "../types/types"
import axiosRequest from "./axiosRequest"
import { parseDjangoError } from "./parseDjangoError"
import { API_METHODS, API_URLS } from "./urls"

type Props = {
    /** Chybová zpráva z požadavku. */
    error: AxiosError
}

/** Zařídí výpis chyby do notifikace a konzole. */
class ErrorMessage extends React.Component<Props> {
    errorResponse = this.props.error.response
    djangoError = parseDjangoError(this.props.error)

    componentDidMount(): void {
        this.logToConsole()
        this.parseError()
    }

    logToConsole = (): void => {
        console.error("Požadavek byl NEÚSPĚŠNÝ: ", this.props.error.config)
        // request proveden, ale neprislo 2xx
        if (this.errorResponse) {
            // log do konzole
            console.error("Status: ", this.errorResponse.status, this.errorResponse.statusText)
            console.error("Data: ", this.errorResponse.data)
            console.error("Headers: ", this.errorResponse.headers)
            console.error("DJANGO/DRF CHYBA: ", this.djangoError)
            console.error("DALŠÍ INFORMACE: ", this.props.error)
        } else {
            // stalo se neco jineho pri priprave requestu
            console.error("Při přípravě requestu nastala chyba: ", this.props.error.message)
        }
    }

    parseError = (): ErrMsg => {
        // request proveden, ale neprislo 2xx
        if (this.errorResponse) {
            // uloz do errMsg neco konkretnejsiho
            if (this.errorResponse.status === 503) {
                return NOTIFY_TEXT.ERROR_TIMEOUT
            } else {
                const djangoError = this.djangoError
                if (typeof djangoError === "string") {
                    return djangoError
                } else if (djangoError && typeof djangoError === "object") {
                    return (
                        <ul>
                            {Object.keys(djangoError).map((field, index) => (
                                <li key={`err${index}`}>
                                    <span className="font-weight-bold">{field}: </span>
                                    <span className="font-italic">{djangoError[field]}</span>
                                </li>
                            ))}
                        </ul>
                    )
                } else {
                    return NOTIFY_TEXT.ERROR
                }
            }
        } else {
            // stalo se neco jineho pri priprave requestu
            return this.props.error.message
        }
    }

    error = this.parseError()

    render(): React.ReactNode {
        return <Notification text={this.error} type={toast.TYPE.ERROR} />
    }
}

/**
 * Wrapper požadavku na API.
 * Prostřednictvím wrapperu axiosu provede a požadavek a zpracuje odpověď.
 * V případě neúspěchu zařídí notifikaci o chybě, v případě úspěchu předá dál celou Response pro další práci.
 */
export const request = <T,>(options: AxiosRequestConfig, ignoreErrors = false): AxiosPromise<T> => {
    const notify = (message: React.ReactNode, level: ToastTypeOptions): void => {
        const toastOptions: ToastOptions = {
            type: level,
            autoClose: level === toast.TYPE.ERROR ? 15000 : 4000,
        }
        toast(message, toastOptions)
    }

    const onSuccess = <T,>(response: AxiosResponse<T>): AxiosResponse<T> => {
        const responseUrl = response.request.responseURL
        console.debug(`%cÚspěch: ${responseUrl}`, "color: green", response)
        if (options.method !== API_METHODS.get) {
            if (
                (responseUrl && !responseUrl.match(API_URLS.login.url)) ||
                responseUrl === undefined
            ) {
                // responseURL neni definovana v IE, tedy v IE se zobrazi vice notifikaci, ale aspon bude appka fungovat
                notify(<Notification type={toast.TYPE.SUCCESS} />, toast.TYPE.SUCCESS)
            }
        }
        return response
    }

    const onError = (error: AxiosError): Promise<any> | undefined | AxiosResponse => {
        if (!ignoreErrors) {
            notify(<ErrorMessage error={error} />, toast.TYPE.ERROR)
            if (error.response) {
                if (error.response.status === 401) {
                    // !! Je potreba odstranit token - mohla totiz nastat situace, kdy server oznacil token jako
                    // nevalidni, ale frontend jej povazuje za "validni" (ale jeho validitu samozrejme v realu
                    // overit nemuze, resi jen expiraci) - pak by doslo k presmerovani na prihlaseni, to ale povazuje
                    // uzivatele za stale prihlaseneho (token neexpiroval, povazuje jej za "validni") a presmerovava
                    // zpatky na puvodni stranku, tedy dojde k zacykleni. Odstranenim tokenu neschopnost frontendu
                    // korektne validovat token vyresime.
                    Token.remove()
                    history.push(APP_URLS.prihlasit.url)
                } else if (error.response.status === 404) {
                    history.push(APP_URLS.nenalezeno.url)
                }
            }
            return Promise.reject(error.response ?? error.message)
        } else {
            return error.response
        }
    }

    return axiosRequest<T>(options)
        .then((response) => onSuccess<T>(response))
        .catch(onError)
}

/** Wrapper požadavku na API, který předá dál pouze získaná data (ne celou Response). */
export const requestData = <T,>(options: AxiosRequestConfig, ignoreErrors = false): Promise<T> => {
    return request<T>(options, ignoreErrors).then((response) => response.data)
}
