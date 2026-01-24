import axios, { AxiosPromise, AxiosRequestConfig } from "axios"

import Token from "../auth/Token"
import { API_URL, JWT_HEADER_PREFIX } from "../global/constants"

/** Instance axiosu pro HTTP požadavky na API. */
const axiosInstance = axios.create({
    baseURL: API_URL,
    xsrfCookieName: "csrftoken",
    xsrfHeaderName: "X-CSRFToken",
})

// funkce pro simulaci dlouheho pozadavku
// const sleep = milliseconds => new Promise(resolve => globalThis.setTimeout(resolve, milliseconds))

/** Vloží do hlavičky HTTP požadavku JWT token. */
const setAuthHeader = (): void => {
    axiosInstance.defaults.headers.common.Authorization = `${JWT_HEADER_PREFIX}${Token.get()}`
}

/** Wrapper pro axios používaný pro HTTP požadavky na API. */
const axiosRequest = <T>(options: AxiosRequestConfig): AxiosPromise<T> => {
    setAuthHeader()
    // pri simulaci dlouheho pozadavku:
    // return sleep(7000).then(() => axiosInstance(options))
    return axiosInstance(options)
}

/** Wrapper pro axios, který automaticky extrahuje data z response. */
export const axiosRequestData = async <T>(options: AxiosRequestConfig): Promise<T> => {
    const response = await axiosRequest<T>(options)
    return response.data
}

export default axiosRequest
