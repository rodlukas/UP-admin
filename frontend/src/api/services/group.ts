import { ClientType, GroupPostApi, GroupPutApi, GroupType } from "../../types/models"
import { requestData } from "../request"
import { API_DELIM, API_METHODS, API_URLS } from "../urls"

const baseUrl = API_URLS.Groups.url

type Item = GroupType
type List = Array<Item>

function get(id: Item["id"]): Promise<Item> {
    return requestData<Item>({
        url: baseUrl + id + API_DELIM,
        method: API_METHODS.get
    })
}

function getAll(): Promise<List> {
    return requestData<List>({
        url: baseUrl,
        method: API_METHODS.get
    })
}

function getActive(): Promise<List> {
    return requestData<List>({
        url: baseUrl + "?" + API_URLS.Groups.filters.active + "=true",
        method: API_METHODS.get
    })
}

function getInactive(): Promise<List> {
    return requestData<List>({
        url: baseUrl + "?" + API_URLS.Groups.filters.active + "=false",
        method: API_METHODS.get
    })
}

function getAllFromClient(clientId: ClientType["id"]): Promise<List> {
    const url = baseUrl + "?" + API_URLS.Groups.filters.client + "=" + clientId
    return requestData<List>({
        url: url,
        method: API_METHODS.get
    })
}

function update(context: GroupPutApi): Promise<Item> {
    return requestData<Item>({
        url: baseUrl + context.id + API_DELIM,
        method: API_METHODS.put,
        data: context
    })
}

function remove(id: Item["id"]): Promise<Item> {
    return requestData<Item>({
        url: baseUrl + id + API_DELIM,
        method: API_METHODS.remove
    })
}

function create(context: GroupPostApi): Promise<Item> {
    return requestData<Item>({
        url: baseUrl,
        method: API_METHODS.post,
        data: context
    })
}

const GroupService = {
    getAll,
    get,
    getActive,
    getInactive,
    create,
    update,
    remove,
    getAllFromClient
}

export default GroupService
