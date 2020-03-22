import { CoursePostApi, CoursePutApi, CourseType } from "../../types/models"
import { requestData } from "../request"
import { API_DELIM, API_METHODS, API_URLS } from "../urls"

const baseUrl = API_URLS.Courses.url

type Item = CourseType
type List = Array<Item>

/** Získá všechny kurzy. */
function getAll(): Promise<List> {
    return requestData<List>({
        url: baseUrl,
        method: API_METHODS.get,
    })
}

/** Získá viditelné kurzy. */
function getVisible(): Promise<List> {
    return requestData<List>({
        url: baseUrl + "?" + API_URLS.Courses.filters.visible + "=true",
        method: API_METHODS.get,
    })
}

/** Aktualizuje (PUT) kurz. */
function update(context: CoursePutApi): Promise<Item> {
    return requestData<Item>({
        url: baseUrl + context.id + API_DELIM,
        method: API_METHODS.put,
        data: context,
    })
}

/** Smaže kurz. */
function remove(id: Item["id"]): Promise<CourseType> {
    return requestData<CourseType>({
        url: baseUrl + id + API_DELIM,
        method: API_METHODS.remove,
    })
}

/** Přidá kurz. */
function create(context: CoursePostApi): Promise<Item> {
    return requestData<Item>({
        url: baseUrl,
        method: API_METHODS.post,
        data: context,
    })
}

const CourseService = {
    getAll,
    create,
    update,
    remove,
    getVisible,
}

export default CourseService
