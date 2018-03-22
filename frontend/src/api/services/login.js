import request from '../request'
import {API_DELIM, API_METHODS, API_URLS} from "../urls"

const baseUrl = API_URLS.Login

function refresh(token) {
    return request({
        url: baseUrl.url + baseUrl.action.refresh + API_DELIM,
        method: API_METHODS.post,
        data: {token}
    })
}

function authenticate(context) {
    return request({
        url: baseUrl.url + baseUrl.action.authenticate + API_DELIM,
        method: API_METHODS.post,
        data: context
    })
}

const LoginService = {
    refresh, authenticate
}

export default LoginService
