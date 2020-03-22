import { AttendancePatchApi, AttendanceType } from "../../types/models"
import { requestData } from "../request"
import { API_DELIM, API_METHODS, API_URLS } from "../urls"

const baseUrl = API_URLS.Attendances.url

type Item = AttendanceType

/** Upraví (PATCH) účast. */
function patch(context: AttendancePatchApi): Promise<Item> {
    return requestData<Item>({
        url: baseUrl + context.id + API_DELIM,
        method: API_METHODS.patch,
        data: context,
    })
}

const AttendanceService = {
    patch,
}

export default AttendanceService
