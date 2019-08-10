import request from "../request"
import { API_DELIM, API_METHODS, API_URLS } from "../urls"

const baseUrl = API_URLS.Clients.url

function get(id) {
    return request({
        url: baseUrl + id + API_DELIM,
        method: API_METHODS.get
    })
}

function getAll() {
    return request({
        url: baseUrl,
        method: API_METHODS.get
    })
}

function getActive() {
    return request({
        url: baseUrl + "?" + API_URLS.Clients.filters.active + "=true",
        method: API_METHODS.get
    })
}

function getInactive() {
    return request({
        url: baseUrl + "?" + API_URLS.Clients.filters.active + "=false",
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

const ClientService = {
    getAll,
    get,
    getActive,
    getInactive,
    create,
    update,
    remove
}

export default ClientService
