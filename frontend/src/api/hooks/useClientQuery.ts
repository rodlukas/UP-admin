import { useQuery } from "@tanstack/react-query"

import { ClientType } from "../../types/models"
import ClientService, { ListWithActiveClients } from "../services/ClientService"

/** Hook pro získání všech klientů. */
export function useClients() {
    return useQuery<ClientType[]>({
        queryKey: ["clients"],
        queryFn: () => ClientService.getAll(),
    })
}

/** Hook pro získání aktivních klientů. */
export function useActiveClients(enabled = true) {
    return useQuery<ListWithActiveClients>({
        queryKey: ["clients", { type: "active" }],
        queryFn: () => ClientService.getActive(),
        enabled,
    })
}

/** Hook pro získání neaktivních klientů. */
export function useInactiveClients(enabled = true) {
    return useQuery<ClientType[]>({
        queryKey: ["clients", { type: "inactive" }],
        queryFn: () => ClientService.getInactive(),
        enabled,
    })
}

/** Hook pro získání jednoho klienta. */
export function useClient(id: ClientType["id"] | undefined) {
    return useQuery<ClientType>({
        queryKey: ["clients", id],
        queryFn: () => {
            if (!id) {
                throw new Error("Client ID is required")
            }
            return ClientService.get(id)
        },
        enabled: !!id,
    })
}
