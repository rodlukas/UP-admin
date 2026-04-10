import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { StatisticsFilters, StatisticsType } from "../../types/models"
import StatisticsService from "../services/StatisticsService"

/** Hook pro získání statistik aplikace. Při změně filtrů automaticky refetchuje.
 *  keepPreviousData zajistí, že při přepnutí roku zůstanou viditelná stará data,
 *  dokud nedorazí nová – stránka se tak nerozskočí do loadingu. */
export function useStatistics(filters?: Partial<StatisticsFilters>) {
    return useQuery<StatisticsType>({
        queryKey: ["stats", filters ?? {}],
        queryFn: () => StatisticsService.get(filters),
        placeholderData: keepPreviousData,
    })
}
