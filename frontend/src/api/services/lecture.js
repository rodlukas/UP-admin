import request from "../request"
import {API_DELIM, API_METHODS, API_URLS, API_ORDERING} from "../urls"

const baseUrl = API_URLS.Lectures.url
const ordering = asc =>
    "&" + API_ORDERING + "=" + (!asc ? '-' : '') + API_URLS.Lectures.ordering.start

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

function getAllFromGroupOrdered(group, asc) {
    const url = baseUrl + "?" + API_URLS.Lectures.filters.group + "=" + group + ordering(asc)
    return request({
        url: url,
        method: API_METHODS.get
    })
}

function getAllFromClientOrdered(client, asc) {
    const url = baseUrl + "?" + API_URLS.Lectures.filters.client + "=" + client + ordering(asc)
    return request({
        url: url,
        method: API_METHODS.get
    })
}

function getAllFromDayOrdered(date, asc) {
    const url = baseUrl + "?" + API_URLS.Lectures.filters.date + "=" + date + ordering(asc)
    return request({
        url: url,
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

const LectureService = {
    getAll, get, create, update, remove, getAllFromDayOrdered, getAllFromGroupOrdered, getAllFromClientOrdered
}

export default LectureService
