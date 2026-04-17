import { useMutation } from "@tanstack/react-query"

import { ClientPostApi, ClientPutApi, ClientType } from "../../types/models"
import ClientService from "../services/ClientService"

/** Hook pro vytvoření klienta. */
export function useCreateClient() {
    return useMutation<ClientType, unknown, ClientPostApi>({
        mutationFn: (data) => ClientService.create(data),
        meta: {
            successMessage: "Klient uložen",
        },
    })
}

/** Hook pro aktualizaci klienta. */
export function useUpdateClient() {
    return useMutation<ClientType, unknown, ClientPutApi>({
        mutationFn: (data) => ClientService.update(data),
        meta: {
            successMessage: "Klient uložen",
        },
    })
}

/** Hook pro smazání klienta. */
export function useDeleteClient() {
    return useMutation<ClientType, unknown, ClientType["id"]>({
        mutationFn: (id) => ClientService.remove(id),
        meta: {
            successMessage: "Klient smazán",
        },
    })
}

/** Hook pro hromadné přesunutí aktivních klientů bez lekce v poslední době do neaktivních. */
export function useDeactivateClients() {
    return useMutation<void, unknown, ClientType["id"][]>({
        mutationFn: (ids) => ClientService.deactivateAll(ids),
        meta: {
            successMessage: "Klienti přesunuti do neaktivních",
        },
    })
}
