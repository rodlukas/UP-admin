import {
    AttendanceStatePatchApi,
    AttendanceStatePostApi,
    AttendanceStatePutApi,
    AttendanceStateType,
} from "../../types/models"
import { axiosRequestData } from "../axiosRequest"
import { API_DELIM, API_METHODS, API_URLS } from "../urls"

const baseUrl = API_URLS.attendanceStates.url

type Item = AttendanceStateType
type List = Item[]

/** Získá všechny stavy účasti. */
function getAll(): Promise<List> {
    return axiosRequestData<List>({
        url: baseUrl,
        method: API_METHODS.get,
    })
}

/** Aktualizuje (PUT) stav účasti. */
function update(context: AttendanceStatePutApi): Promise<Item> {
    return axiosRequestData<Item>({
        url: `${baseUrl}${context.id}${API_DELIM}`,
        method: API_METHODS.put,
        data: context,
    })
}

/** Aktualizuje (PATCH) stav účasti. */
function patch(context: AttendanceStatePatchApi): Promise<Item> {
    return axiosRequestData<Item>({
        url: `${baseUrl}${context.id}${API_DELIM}`,
        method: API_METHODS.patch,
        data: context,
    })
}

/** Smaže stav účasti. */
function remove(id: Item["id"]): Promise<AttendanceStateType> {
    return axiosRequestData<AttendanceStateType>({
        url: `${baseUrl}${id}${API_DELIM}`,
        method: API_METHODS.remove,
    })
}

/** Přidá stav účasti. */
function create(context: AttendanceStatePostApi): Promise<Item> {
    return axiosRequestData<Item>({
        url: baseUrl,
        method: API_METHODS.post,
        data: context,
    })
}

const AttendanceStateService = {
    getAll,
    create,
    update,
    remove,
    patch,
}

export default AttendanceStateService
