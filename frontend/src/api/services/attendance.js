import request from "../request"
import { API_DELIM, API_METHODS, API_URLS } from "../urls"

const baseUrl = API_URLS.Attendances.url

function patch(context) {
    return request({
        url: baseUrl + context.id + API_DELIM,
        method: API_METHODS.patch,
        data: context
    })
}

const AttendanceService = {
    patch
}

export default AttendanceService
