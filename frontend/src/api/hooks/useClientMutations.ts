import { useMutation } from "@tanstack/react-query"

import { ClientPostApi, ClientPutApi, ClientType } from "../../types/models"
import ClientService from "../services/ClientService"

/** Hook pro vytvoření klienta. */
export function useCreateClient() {
    return useMutation<ClientType, unknown, ClientPostApi>({
        mutationFn: (data) => ClientService.create(data),
    })
}

/** Hook pro aktualizaci klienta. */
export function useUpdateClient() {
    return useMutation<ClientType, unknown, ClientPutApi>({
        mutationFn: (data) => ClientService.update(data),
    })
}

/** Hook pro smazání klienta. */
export function useDeleteClient() {
    return useMutation<ClientType, unknown, ClientType["id"]>({
        mutationFn: (id) => ClientService.remove(id),
    })
}
