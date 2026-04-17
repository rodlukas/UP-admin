import { ClientType, GroupPostApi, GroupPutApi, GroupType } from "../../types/models"
import { axiosRequestData } from "../axiosRequest"
import { API_DELIM, API_METHODS, API_URLS } from "../urls"

const baseUrl = API_URLS.groups.url

type Item = GroupType
type List = Item[]

/** Získá skupinu. */
function get(id: Item["id"]): Promise<Item> {
    return axiosRequestData<Item>({
        url: `${baseUrl}${id}${API_DELIM}`,
        method: API_METHODS.get,
    })
}

/** Získá všechny skupiny. */
function getAll(): Promise<List> {
    return axiosRequestData<List>({
        url: baseUrl,
        method: API_METHODS.get,
    })
}

/** Získá aktivní skupiny. */
function getActive(): Promise<List> {
    return axiosRequestData<List>({
        url: `${baseUrl}?${API_URLS.groups.filters.active}=true`,
        method: API_METHODS.get,
    })
}

/** Získá neaktivní skupinÿ. */
function getInactive(): Promise<List> {
    return axiosRequestData<List>({
        url: `${baseUrl}?${API_URLS.groups.filters.active}=false`,
        method: API_METHODS.get,
    })
}

/** Získá skupiny zadaného klienta (jen aktuální členství). */
function getAllFromClient(clientId: ClientType["id"]): Promise<List> {
    const url = `${baseUrl}?${API_URLS.groups.filters.client}=${clientId}`
    return axiosRequestData<List>({
        url: url,
        method: API_METHODS.get,
    })
}

/** Získá skupiny, které klient opustil (má tam účast na lekci, ale již není členem). */
function getAllEverFromClient(clientId: ClientType["id"]): Promise<List> {
    const url = `${baseUrl}?${API_URLS.groups.filters.client}=${clientId}&${API_URLS.groups.filters.onlyPast}=true`
    return axiosRequestData<List>({
        url: url,
        method: API_METHODS.get,
    })
}

/** Aktualizuje (PUT) skupinu. */
function update(context: GroupPutApi): Promise<Item> {
    return axiosRequestData<Item>({
        url: `${baseUrl}${context.id}${API_DELIM}`,
        method: API_METHODS.put,
        data: context,
    })
}

/** Smaže skupinu. */
function remove(id: Item["id"]): Promise<Item> {
    return axiosRequestData<Item>({
        url: `${baseUrl}${id}${API_DELIM}`,
        method: API_METHODS.remove,
    })
}
/** Přidá skupinu. */
function create(context: GroupPostApi): Promise<Item> {
    return axiosRequestData<Item>({
        url: baseUrl,
        method: API_METHODS.post,
        data: context,
    })
}

/** Hromadně deaktivuje skupiny. */
function deactivateAll(ids: Item["id"][]): Promise<void> {
    return axiosRequestData<void>({
        url: `${baseUrl}deactivate-bulk${API_DELIM}`,
        method: API_METHODS.patch,
        data: { ids },
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
    deactivateAll,
    getAllFromClient,
    getAllEverFromClient,
}

export default GroupService
