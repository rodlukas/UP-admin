import { ApplicationPostApi, ApplicationPutApi, ApplicationType } from "../../types/models"
import { axiosRequestData } from "../axiosRequest"
import { API_DELIM, API_METHODS, API_URLS } from "../urls"

const baseUrl = API_URLS.applications.url

type Item = ApplicationType
type List = Item[]

/** Získá všechny zájemce o kurzy. */
function getAll(): Promise<List> {
    return axiosRequestData<List>({
        url: baseUrl,
        method: API_METHODS.get,
    })
}

/** Aktualizuje (PUT) zájemce o kurz. */
function update(context: ApplicationPutApi): Promise<Item> {
    return axiosRequestData<Item>({
        url: `${baseUrl}${context.id}${API_DELIM}`,
        method: API_METHODS.put,
        data: context,
    })
}

/** Smaže zájemce o kurz. */
function remove(id: Item["id"]): Promise<Item> {
    return axiosRequestData<Item>({
        url: `${baseUrl}${id}${API_DELIM}`,
        method: API_METHODS.remove,
    })
}

/** Přidá zájemce o kurz. */
function create(context: ApplicationPostApi): Promise<Item> {
    return axiosRequestData<Item>({
        url: baseUrl,
        method: API_METHODS.post,
        data: context,
    })
}

const ApplicationService = {
    getAll,
    create,
    update,
    remove,
}

export default ApplicationService
