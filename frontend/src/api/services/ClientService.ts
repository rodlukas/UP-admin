import { ClientActiveType, ClientPostApi, ClientPutApi, ClientType } from "../../types/models"
import { requestData } from "../request"
import { API_DELIM, API_METHODS, API_URLS } from "../urls"

const baseUrl = API_URLS.clients.url

type Item = ClientType
type List = Item[]
export type ListWithActiveClients = ClientActiveType[]

/** Získá klienta. */
function get(id: Item["id"]): Promise<Item> {
    return requestData<Item>({
        url: `${baseUrl}${id}${API_DELIM}`,
        method: API_METHODS.get,
    })
}

function getAll(): Promise<List> {
    return requestData<List>({
        url: baseUrl,
        method: API_METHODS.get,
    })
}

function getActive(): Promise<ListWithActiveClients> {
    return requestData<ListWithActiveClients>({
        url: `${baseUrl}?${API_URLS.clients.filters.active}=true`,
        method: API_METHODS.get,
    })
}

function getInactive(): Promise<List> {
    return requestData<List>({
        url: `${baseUrl}?${API_URLS.clients.filters.active}=false`,
        method: API_METHODS.get,
    })
}

function update(context: ClientPutApi): Promise<Item> {
    return requestData<Item>({
        url: `${baseUrl}${context.id}${API_DELIM}`,
        method: API_METHODS.put,
        data: context,
    })
}

function remove(id: Item["id"]): Promise<Item> {
    return requestData<Item>({
        url: `${baseUrl}${id}${API_DELIM}`,
        method: API_METHODS.remove,
    })
}

function create(context: ClientPostApi): Promise<Item> {
    return requestData<Item>({
        url: baseUrl,
        method: API_METHODS.post,
        data: context,
    })
}

const ClientService = {
    getAll,
    get,
    getActive,
    getInactive,
    create,
    update,
    remove,
}

export default ClientService
