import { useQuery } from "@tanstack/react-query"

import { ClientType, GroupType } from "../../types/models"
import GroupService from "../services/GroupService"

/** Hook pro získání všech skupin. */
export function useGroups() {
    return useQuery<GroupType[]>({
        queryKey: ["groups"],
        queryFn: () => GroupService.getAll(),
    })
}

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

/** Hook pro získání jedné skupiny. */
export function useGroup(id: GroupType["id"] | undefined) {
    return useQuery<GroupType>({
        queryKey: ["groups", id],
        queryFn: () => {
            if (!id) {
                throw new Error("Group ID is required")
            }
            return GroupService.get(id)
        },
        enabled: !!id,
    })
}

/** Hook pro získání skupin daného klienta. */
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
