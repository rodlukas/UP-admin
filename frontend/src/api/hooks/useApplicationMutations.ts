import { useMutation } from "@tanstack/react-query"

import { ApplicationPostApi, ApplicationPutApi, ApplicationType } from "../../types/models"
import ApplicationService from "../services/ApplicationService"

/** Hook pro vytvoření zájemce o kurz. */
export function useCreateApplication() {
    return useMutation<ApplicationType, unknown, ApplicationPostApi>({
        mutationFn: (data) => ApplicationService.create(data),
    })
}

/** Hook pro aktualizaci zájemce o kurz. */
export function useUpdateApplication() {
    return useMutation<ApplicationType, unknown, ApplicationPutApi>({
        mutationFn: (data) => ApplicationService.update(data),
    })
}

/** Hook pro smazání zájemce o kurz. */
export function useDeleteApplication() {
    return useMutation<ApplicationType, unknown, ApplicationType["id"]>({
        mutationFn: (id) => ApplicationService.remove(id),
    })
}
