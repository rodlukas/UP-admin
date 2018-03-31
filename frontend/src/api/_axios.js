import axios from 'axios'
import {API_URL, JWT_HEADER_PREFIX} from "../global/constants"
import AuthService from "../auth/authService"

axios.defaults.baseURL = API_URL
axios.defaults.xsrfCookieName = 'csrftoken'
axios.defaults.xsrfHeaderName = 'X-CSRFToken'
axios.defaults.headers.common['Authorization'] = JWT_HEADER_PREFIX + AuthService.getToken()

export default axios
