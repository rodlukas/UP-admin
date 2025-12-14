import {
    ClientType,
    GroupType,
    LecturePostApi,
    LecturePutApi,
    LectureType,
    LectureTypeWithDate,
} from "../../types/models"
import { axiosRequestData } from "../axiosRequest"
import { API_DELIM, API_METHODS, API_ORDERING, API_URLS } from "../urls"

const baseUrl = API_URLS.lectures.url
const ordering = (asc: boolean): string =>
    `&${API_ORDERING}=${!asc ? "-" : ""}${API_URLS.lectures.ordering.start}`

type Item = LectureType
type List = Item[]
type ListWithDate = LectureTypeWithDate[]

/** Získá lekci. */
function get(id: Item["id"]): Promise<Item> {
    return axiosRequestData<Item>({
        url: `${baseUrl}${id}${API_DELIM}`,
        method: API_METHODS.get,
    })
}

/** Získá všechny lekce. */
function getAll(): Promise<List> {
    return axiosRequestData<List>({
        url: baseUrl,
        method: API_METHODS.get,
    })
}

/** Získá všechny lekce dané skupiny (umožňuje definovat řazení). */
function getAllFromGroupOrdered(group: GroupType["id"], asc: boolean): Promise<List> {
    const url = `${baseUrl}?${API_URLS.lectures.filters.group}=${group}${ordering(asc)}`
    return axiosRequestData<List>({
        url: url,
        method: API_METHODS.get,
    })
}

/** Získá všechny lekce daného klienta (umožňuje definovat řazení). */
function getAllFromClientOrdered(client: ClientType["id"], asc: boolean): Promise<List> {
    const url = `${baseUrl}?${API_URLS.lectures.filters.client}=${client}${ordering(asc)}`
    return axiosRequestData<List>({
        url: url,
        method: API_METHODS.get,
    })
}

/** Získá všechny lekce v daném dni (umožňuje definovat řazení). */
function getAllFromDayOrdered(date: string, asc: boolean): Promise<ListWithDate> {
    const url = `${baseUrl}?${API_URLS.lectures.filters.date}=${date}${ordering(asc)}`
    return axiosRequestData<ListWithDate>({
        url: url,
        method: API_METHODS.get,
    })
}

/** Aktualizuje (PUT) lekci. */
function update(context: LecturePutApi): Promise<Item> {
    return axiosRequestData<Item>({
        url: `${baseUrl}${context.id}${API_DELIM}`,
        method: API_METHODS.put,
        data: context,
    })
}

/** Smaže lekci. */
function remove(id: Item["id"]): Promise<Item> {
    return axiosRequestData<Item>({
        url: `${baseUrl}${id}${API_DELIM}`,
        method: API_METHODS.remove,
    })
}

function create(context: LecturePostApi | LecturePostApi[]): Promise<Item> {
    return axiosRequestData<Item>({
        url: baseUrl,
        method: API_METHODS.post,
        data: context,
    })
}

const LectureService = {
    getAll,
    get,
    create,
    update,
    remove,
    getAllFromDayOrdered,
    getAllFromGroupOrdered,
    getAllFromClientOrdered,
}

export default LectureService
