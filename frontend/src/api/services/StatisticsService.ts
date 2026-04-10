import { StatisticsFilters, StatisticsType } from "../../types/models"
import { axiosRequestData } from "../axiosRequest"
import { API_METHODS, API_URLS } from "../urls"

/** Získá statistiky aplikace s volitelnými filtry. */
function get(filters?: Partial<StatisticsFilters>): Promise<StatisticsType> {
    const params = new URLSearchParams()
    if (filters?.year != null) {
        params.set("year", String(filters.year))
    }
    const query = params.toString()
    return axiosRequestData<StatisticsType>({
        url: query ? `${API_URLS.stats.url}?${query}` : API_URLS.stats.url,
        method: API_METHODS.get,
    })
}

const StatisticsService = {
    get,
}

export default StatisticsService
