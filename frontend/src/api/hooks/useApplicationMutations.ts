import { useMutation, useQueryClient } from "@tanstack/react-query"

import { ApplicationPostApi, ApplicationPutApi, ApplicationType } from "../../types/models"
import ApplicationService from "../services/ApplicationService"

/** Hook pro vytvoření zájemce o kurz. */
export function useCreateApplication() {
    const queryClient = useQueryClient()

    return useMutation<ApplicationType, unknown, ApplicationPostApi>({
        mutationFn: (data) => ApplicationService.create(data),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ["applications"] })
        },
    })
}

/** Hook pro aktualizaci zájemce o kurz. */
export function useUpdateApplication() {
    const queryClient = useQueryClient()

    return useMutation<ApplicationType, unknown, ApplicationPutApi>({
        mutationFn: (data) => ApplicationService.update(data),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ["applications"] })
        },
    })
}

/** Hook pro smazání zájemce o kurz. */
export function useDeleteApplication() {
    const queryClient = useQueryClient()

    return useMutation<ApplicationType, unknown, ApplicationType["id"]>({
        mutationFn: (id) => ApplicationService.remove(id),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ["applications"] })
        },
    })
}
