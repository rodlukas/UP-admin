import axios from 'axios'
import {API_URL, NOTIFY_TEXT, NOTIFY_LEVEL} from '../global/GlobalConstants'
import {toast} from "react-toastify"
import AuthService from "../Auth/AuthService"

axios.defaults.baseURL = API_URL
axios.defaults.xsrfCookieName = 'csrftoken'
axios.defaults.xsrfHeaderName = 'X-CSRFToken'
axios.defaults.headers.common['Authorization'] = AuthService.getToken()


const request = function (options) {
    const onSuccess = function (response) {
        console.log('Request on ' + response.request.responseURL + ' successfull', response)
        if (options.method !== 'get' && !response.request.responseURL.match('jwt'))
            notify(NOTIFY_TEXT.SUCCESS, NOTIFY_LEVEL.SUCCESS)
        return response.data
    }

    const onError = function (error) {
        console.error('Request Failed:', error.config)

        if (error.response) {
            // Request was made but server responded with something
            // other than 2xx
            console.error('Status:', error.response.status)
            console.error('Data:', error.response.data)
            console.error('Headers:', error.response.headers)

        } else {
            // Something else happened while setting up the request
            // triggered the error
            console.error('Error Message:', error.message)
        }
        notify(NOTIFY_TEXT.ERROR, NOTIFY_LEVEL.ERROR)
        if (error.response.status === 401)
            window.location.href = "/prihlasit" // TODO
        return Promise.reject(error.response || error.message)
    }

    let notify = (message, level) => {
        const options = {
            type: level,
            position: toast.POSITION.TOP_CENTER
        }
        toast(message, options)
    }

    return axios(options)
        .then(onSuccess)
        .catch(onError)
}

export default request
