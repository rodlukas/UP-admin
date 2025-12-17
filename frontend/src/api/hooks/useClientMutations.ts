import { useMutation, useQueryClient } from "@tanstack/react-query"

import { ClientPostApi, ClientPutApi, ClientType } from "../../types/models"
import ClientService from "../services/ClientService"

/** Hook pro vytvoření klienta. */
export function useCreateClient() {
    const queryClient = useQueryClient()

    return useMutation<ClientType, unknown, ClientPostApi>({
        mutationFn: (data) => ClientService.create(data),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ["clients"] })
        },
    })
}

/** Hook pro aktualizaci klienta. */
export function useUpdateClient() {
    const queryClient = useQueryClient()

    return useMutation<ClientType, unknown, ClientPutApi>({
        mutationFn: (data) => ClientService.update(data),
        onSuccess: (data) => {
            queryClient.setQueryData(["clients", data.id], data)
            void queryClient.invalidateQueries({ queryKey: ["clients"] })
            void queryClient.invalidateQueries({ queryKey: ["groups"] })
        },
    })
}

/** Hook pro smazání klienta. */
export function useDeleteClient() {
    const queryClient = useQueryClient()

    return useMutation<ClientType, unknown, ClientType["id"]>({
        mutationFn: (id) => ClientService.remove(id),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ["clients"] })
            void queryClient.invalidateQueries({ queryKey: ["groups"] })
        },
    })
}
