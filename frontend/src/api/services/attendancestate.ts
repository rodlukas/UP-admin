import {
    AttendanceStatePatchApi,
    AttendanceStatePostApi,
    AttendanceStatePutApi,
    AttendanceStateType
} from "../../types/models"
import { requestData } from "../request"
import { API_DELIM, API_METHODS, API_URLS } from "../urls"

const baseUrl = API_URLS.AttendanceStates.url

type Item = AttendanceStateType
type List = Array<Item>

function getAll(): Promise<List> {
    return requestData<List>({
        url: baseUrl,
        method: API_METHODS.get
    })
}

function update(context: AttendanceStatePutApi): Promise<Item> {
    return requestData<Item>({
        url: baseUrl + context.id + API_DELIM,
        method: API_METHODS.put,
        data: context
    })
}

function patch(context: AttendanceStatePatchApi): Promise<Item> {
    return requestData<Item>({
        url: baseUrl + context.id + API_DELIM,
        method: API_METHODS.patch,
        data: context
    })
}

function remove(id: Item["id"]): Promise<AttendanceStateType> {
    return requestData<AttendanceStateType>({
        url: baseUrl + id + API_DELIM,
        method: API_METHODS.remove
    })
}

function create(context: AttendanceStatePostApi): Promise<Item> {
    return requestData<Item>({
        url: baseUrl,
        method: API_METHODS.post,
        data: context
    })
}

const AttendanceStateService = {
    getAll,
    create,
    update,
    remove,
    patch
}

export default AttendanceStateService
