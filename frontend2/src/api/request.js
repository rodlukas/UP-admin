import axios, {setAuthHeader} from './_axios'
import {NOTIFY_TEXT, NOTIFY_LEVEL} from '../global/constants'
import {toast} from "react-toastify"
import {API_METHODS, API_URLS} from "./urls"
import APP_URLS from "../urls"
import AuthService from "../auth/authService"


const request = function (options) {

    const onSuccess = function (response) {
        console.log('Request on ' + response.request.responseURL + ' successfull', response)
        if (options.method !== API_METHODS.get && !response.request.responseURL.match(API_URLS.Login.url))
            notify(NOTIFY_TEXT.SUCCESS, NOTIFY_LEVEL.SUCCESS)
        return response.data
    }

    const onError = function (error) {
        console.error('Request Failed:', error.config)
        if (error.response) { // request proveden, ale neprislo 2xx
            console.error('Status:', error.response.status)
            console.error('Data:', error.response.data)
            console.error('Headers:', error.response.headers)
            console.warn('DALSI INFORMACE: ', error)
            console.warn('API VALIDATION ERROR: ', error.request.response)
        } else { // stalo se neco jineho pri priprave requestu
            console.error('Error Message:', error.message)
        }
        notify(NOTIFY_TEXT.ERROR, NOTIFY_LEVEL.ERROR)
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
