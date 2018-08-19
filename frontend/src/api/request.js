import axiosRequest from "./_axios"
import {NOTIFY_TEXT} from "../global/constants"
import {toast} from "react-toastify"
import {API_METHODS, API_URLS} from "./urls"
import APP_URLS from "../urls"
import history from "../global/history"

const request = function (options) {
    const onSuccess = response => {
        const responseUrl = response.request.responseURL
        console.info('%cÚspěch: ' + responseUrl, 'color: green', response)
        if (options.method !== API_METHODS.get)
            if((responseUrl && !responseUrl.match(API_URLS.Login.url))
                || responseUrl === undefined) // responseURL neni definovana v IE, tedy v IE se zobrazi vice notifikaci, ale aspon bude appka fungovat
                notify(NOTIFY_TEXT.SUCCESS, toast.TYPE.SUCCESS)
        return response.data
    }

    const onError = error => {
        let errMsg = NOTIFY_TEXT.ERROR
        console.error('Požadavek byl NEÚSPĚŠNÝ: ', error.config)
        if (error.response) { // request proveden, ale neprislo 2xx
            const errObj = error.request.response
            const errorResponse = error.response
            console.error('Status: ',           errorResponse.status, errorResponse.statusText)
            console.error('Data: ',             errorResponse.data)
            console.error('Headers: ',          errorResponse.headers)
            console.error('DJANGO/DRF CHYBA: ', errObj)
            console.error('DALŠÍ INFORMACE: ',  error)
            if("x-sentry-id" in errorResponse.headers)
                console.info('SENTRY ID: ',     errorResponse.headers["x-sentry-id"])
            // uloz do errMsg neco konkretnejsiho
            let json
            try {
                json = JSON.parse(errObj) // rozparsuj JSON objekt
                if (Array.isArray(json)) // pokud se pridava (neupdatuje) a chyba se vztahuje ke konkretnimu field, vraci se pole, vezmi z nej prvni chybu
                    json = json[0]
                if (json['non_field_errors']) // obecna chyba nevztazena ke konkretnimu field
                    errMsg = json['non_field_errors']
                else if (json['detail']) // chyba muze obsahovat detailni informace (napr. metoda PUT neni povolena)
                    errMsg = json['detail']
                else if (json[Object.keys(json)[0]]) // chyba vztazena ke konkretnimu field
                    errMsg = json
            }
            catch (error) {
                console.error(error)
            }

        } else { // stalo se neco jineho pri priprave requestu
            console.error('Error Message: ', error.message)
            errMsg = error.message
        }
        // stringify, kdyz prijde objekt
        if(typeof errMsg === 'object')
            errMsg = JSON.stringify(errMsg)
        notify(errMsg, toast.TYPE.ERROR)
        if (error.response.status === 401)
            history.push(APP_URLS.prihlasit)
        else if (error.response.status === 404)
            window.location.href = APP_URLS.notfound //TODO
        return Promise.reject(error.response || error.message)
    }

    const notify = (message, level) => {
        const options = {
            type: level,
            position: toast.POSITION.TOP_CENTER
        }
        toast(message, options)
    }

    return axiosRequest(options)
        .then(onSuccess)
        .catch(onError)
}

export default request
