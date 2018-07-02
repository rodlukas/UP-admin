import request from '../request'
import {API_DELIM, API_METHODS, API_URLS} from "../urls"

const baseUrl = API_URLS.AttendanceStates.url

function getAll() {
    return request({
        url: baseUrl,
        method: API_METHODS.get
    })
}

function update(context) {
    return request({
        url: baseUrl + context.id + API_DELIM,
        method: API_METHODS.put,
        data: context
    })
}

function patch(context) {
    return request({
        url: baseUrl + context.id + API_DELIM,
        method: API_METHODS.patch,
        data: context
    })
}

function remove(id) {
    return request({
        url: baseUrl + id + API_DELIM,
        method: API_METHODS.remove
    })
}

function create(context) {
    return request({
        url: baseUrl,
        method: API_METHODS.post,
        data: context
    })
}

const AttendanceStateService = {
    getAll, create, update, remove, patch
}

export default AttendanceStateService
