import axios, {setAuthHeader} from "./_axios"
import {NOTIFY_TEXT, NOTIFY_LEVEL} from "../global/constants"
import {toast} from "react-toastify"
import {API_METHODS, API_URLS} from "./urls"
import APP_URLS from "../urls"
import AuthService from "../auth/authService"


const request = function (options) {

    const onSuccess = function (response) {
        console.info('%c Success: ' + response.request.responseURL, 'color: green', response)
        if (options.method !== API_METHODS.get && !response.request.responseURL.match(API_URLS.Login.url))
            notify(NOTIFY_TEXT.SUCCESS, NOTIFY_LEVEL.SUCCESS)
        return response.data
    }

    const onError = function (error) {
        let errMsg = NOTIFY_TEXT.ERROR
        console.error('Request Failed:', error.config)
        if (error.response) { // request proveden, ale neprislo 2xx
            console.error('Status: ', error.response.status)
            console.error('Data: ', error.response.data)
            console.error('Headers: ', error.response.headers)
            console.error('DALSI INFORMACE: ', error)
            console.error('API VALIDATION ERROR: ', error.request.response)
            const json = JSON.parse(error.request.response)
            if(json['non_field_errors'])
                errMsg = json['non_field_errors'][0]
            else if(json['detail'])
                errMsg = json['detail'][0]
        } else { // stalo se neco jineho pri priprave requestu
            console.error('Error Message: ', error.message)
            errMsg = error.message
        }
        notify(errMsg, NOTIFY_LEVEL.ERROR)
        if (error.response.status === 401)
            window.location.href = APP_URLS.prihlasit //TODO
        else if (error.response.status === 404)
            window.location.href = APP_URLS.notfound //TODO

        return Promise.reject(error.response || error.message)
    }

    let notify = (message, level) => {
        const options = {
            type: level,
            position: toast.POSITION.TOP_CENTER
        }
        toast(message, options)
    }

    setAuthHeader(AuthService.getToken())
    return axios(options)
        .then(onSuccess)
        .catch(onError)
}

export default request
