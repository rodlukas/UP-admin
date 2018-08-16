import axios from "axios"
import {API_URL, JWT_HEADER_PREFIX} from "../global/constants"
import {Token} from "../auth/AuthContext"

const axiosInstance = axios.create({
    baseURL: API_URL,
    xsrfCookieName: 'csrftoken',
    xsrfHeaderName: 'X-CSRFToken'
})

const setAuthHeader = () =>
    axiosInstance.defaults.headers.common['Authorization'] = JWT_HEADER_PREFIX + Token.get()

const axiosRequest = options => {
    setAuthHeader()
    return axiosInstance(options)
}

export default axiosRequest
