import axios from "axios"
import { Token } from "../auth/AuthContext"
import { API_URL, JWT_HEADER_PREFIX } from "../global/constants"

const axiosInstance = axios.create({
    baseURL: API_URL,
    xsrfCookieName: "csrftoken",
    xsrfHeaderName: "X-CSRFToken"
})

// funkce pro simulaci dlouheho pozadavku
// const sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds))

const setAuthHeader = () =>
    (axiosInstance.defaults.headers.common["Authorization"] = JWT_HEADER_PREFIX + Token.get())

const axiosRequest = options => {
    setAuthHeader()
    // pri simulaci dlouheho pozadavku:
    // return sleep(7000).then(() => axiosInstance(options))
    return axiosInstance(options)
}

export default axiosRequest
