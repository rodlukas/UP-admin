import { useMutation, useQueryClient } from "@tanstack/react-query"

import { ClientPostApi, ClientPutApi, ClientType } from "../../types/models"
import ClientService from "../services/ClientService"

/** Hook pro vytvoření klienta. */
export function useCreateClient() {
    const queryClient = useQueryClient()

    return useMutation<ClientType, unknown, ClientPostApi>({
        mutationFn: (data) => ClientService.create(data),
        onSuccess: () => {
            // Invalidovat cache pro klienty (invaliduje i ["clients", "active"], ["clients", "inactive"], atd.)
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
            // Aktualizovat konkrétního klienta v cache
            queryClient.setQueryData(["clients", data.id], data)
            // Invalidovat cache pro klienty (invaliduje i ["clients", "active"], ["clients", "inactive"], atd.)
            void queryClient.invalidateQueries({ queryKey: ["clients"] })
            // Invalidovat skupiny, protože změna klienta může ovlivnit skupiny (např. změna active)
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
            // Invalidovat cache pro klienty (invaliduje i ["clients", "active"], ["clients", "inactive"], atd.)
            void queryClient.invalidateQueries({ queryKey: ["clients"] })
            // Invalidovat skupiny, protože smazání klienta může ovlivnit skupiny
            void queryClient.invalidateQueries({ queryKey: ["groups"] })
        },
    })
}
