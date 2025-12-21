import { useQuery } from "@tanstack/react-query"

import { ApplicationType } from "../../types/models"
import ApplicationService from "../services/ApplicationService"

/** Hook pro získání všech zájemců o kurzy. */
export function useApplications() {
    return useQuery<ApplicationType[]>({
        queryKey: ["applications"],
        queryFn: () => ApplicationService.getAll(),
    })
}
