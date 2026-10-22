import { useQuery } from "@tanstack/react-query"

import { type ClientType, type GroupType } from "../../types/models"
import GroupService from "../services/GroupService"

/** Hook pro získání aktivních skupin. */
export function useActiveGroups(enabled = true) {
    return useQuery<GroupType[]>({
        queryKey: ["groups", { type: "active" }],
        queryFn: () => GroupService.getActive(),
        enabled,
    })
}

/** Hook pro získání neaktivních skupin. */
export function useInactiveGroups(enabled = true) {
    return useQuery<GroupType[]>({
        queryKey: ["groups", { type: "inactive" }],
        queryFn: () => GroupService.getInactive(),
        enabled,
    })
}

/** Klíč query s detailem skupiny (sdílí ho `useGroup` a `useDeleteGroup`). */
export const groupQueryKey = (id: GroupType["id"] | undefined) => ["groups", id] as const

/** Hook pro získání jedné skupiny. */
export function useGroup(id: GroupType["id"] | undefined) {
    return useQuery<GroupType>({
        queryKey: groupQueryKey(id),
        queryFn: () => {
            if (!id) {
                throw new Error("Group ID is required")
            }
            return GroupService.get(id)
        },
        enabled: !!id,
    })
}

/** Hook pro získání skupin daného klienta (jen aktuální členství). */
export function useGroupsFromClient(clientId: ClientType["id"] | undefined) {
    return useQuery<GroupType[]>({
        queryKey: ["groups", { client: clientId }],
        queryFn: () => {
            if (!clientId) {
                throw new Error("Client ID is required")
            }
            return GroupService.getAllFromClient(clientId)
        },
        enabled: !!clientId,
    })
}

/** Hook pro získání skupin, které klient opustil (má tam účast na lekci, ale již není členem). */
export function useAllGroupsEverFromClient(clientId: ClientType["id"] | undefined) {
    return useQuery<GroupType[]>({
        queryKey: ["groups", { client: clientId, onlyPast: true }],
        queryFn: () => {
            if (!clientId) {
                throw new Error("Client ID is required")
            }
            return GroupService.getAllEverFromClient(clientId)
        },
        enabled: !!clientId,
    })
}
